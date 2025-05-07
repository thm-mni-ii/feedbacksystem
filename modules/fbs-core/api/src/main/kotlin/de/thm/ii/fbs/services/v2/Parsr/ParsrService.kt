package de.thm.ii.fbs.services.v2.Parsr

import java.io.ByteArrayOutputStream
import java.time.Duration
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.*
import org.apache.commons.compress.archivers.zip.ZipFile
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel
import org.apache.pdfbox.pdmodel.PDDocument
import org.springframework.core.io.ByteArrayResource
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import java.nio.file.Paths
import kotlin.io.path.absolutePathString
import kotlin.io.path.outputStream

@Service
class ParsrService {
    private val parsrClient: WebClient = WebClient.builder()
            .baseUrl("http://parsr:3001")
            .codecs { it.defaultCodecs().maxInMemorySize(10 * 1024 * 1024) } // 10 MB
            .build()
    private val documentCache = ConcurrentHashMap<String, String>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    fun sendPdfToParsr(file: MultipartFile): String {
        val convertedPdf = convertPdfToVersion(file, 1.4f)
        val convertedResource = object : ByteArrayResource(convertedPdf) {
            override fun getFilename(): String = file.originalFilename ?: "converted.pdf"
        }

        val configJson = """
        {
            "version": "3.0.0",
            "languages": ["de"],
            "ocr": { "enabled": false },
            "cleaning": {
                "removeHeaders": true,
                "removeFooters": true,
                "removePageNumbers": true
            },
            "content": {
                "splitParagraphs": true,
                "joinHyphenatedWords": true
            },
            "output": { "format": "markdown" },
            "pdf": { "pages": "all" }
        }
    """.trimIndent()

        val multipartData = LinkedMultiValueMap<String, Any>().apply {
            add("file", convertedResource)
            add("config", configJson)
        }

        val startTime = System.currentTimeMillis()
        val response = parsrClient
                .post()
                .uri("/api/v1/document")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(multipartData))
                .retrieve()
                .bodyToMono<String>()
                .block(Duration.ofSeconds(120))
                ?: throw RuntimeException("Empty response from Parsr")

        val jobId = response.trim()
        println("📤 Upload & Jobstart fertig in ${System.currentTimeMillis() - startTime} ms (Job-ID: $jobId)")

        coroutineScope.launch {
            val pollStart = System.currentTimeMillis()
            try {
                val zipResult = try {
                    pollParsrResult(jobId)
                } catch (e: Exception) {
                    println("⚠️ ZIP-Polling fehlgeschlagen (${e.message}), versuche Nur-Markdown...")
                    null
                }

                if (zipResult != null) {
                    println("📥 Download ZIP fertig in ${System.currentTimeMillis() - pollStart} ms")
                    try {
                        val unzipStart = System.currentTimeMillis()
                        val withImages = unzipZip(zipResult)
                        println("🖼️ Entpacken & Ersetzen der Bilder dauerte ${System.currentTimeMillis() - unzipStart} ms")
                        documentCache[jobId] = withImages
                        println("✅ Markdown mit Bildern gecacht für Job: $jobId")
                    } catch (e: Exception) {
                        println("⚠️ Fehler beim Entpacken, versuche Nur-Markdown: ${e.message}")
                        Paths.get("/upload-dir", "temp.zip").outputStream().write(zipResult)
                        println(Paths.get("/upload-dir", "temp.zip").absolutePathString())
                        val fallback = fetchMarkdownWithoutZip(jobId)
                        documentCache[jobId] = fallback
                    }
                } else {
                    val fallback = fetchMarkdownWithoutZip(jobId)
                    documentCache[jobId] = fallback
                    println("✅ Nur-Markdown gecacht für Job: $jobId (ZIP-Download übersprungen)")
                }
            } catch (e: Exception) {
                println("❌ Fehler bei Parsr-Verarbeitung für Job $jobId: ${e.message}")
                documentCache.remove(jobId)
            }
        }

        return jobId
    }

    fun getParsedDocument(jobId: String): String {
        return documentCache[jobId] ?: throw RuntimeException("Document not found")
    }

    private suspend fun pollParsrResult(jobId: String): ByteArray? {
        var retries = 0
        val maxRetries = 30
        val waittime = 5000L

        while (retries < maxRetries) {
            try {
                println("🔄 Polling-Versuch ${retries + 1}/$maxRetries")
                return parsrClient
                        .get()
                        .uri("/api/v1/markdown/$jobId?download=1")
                        .retrieve()
                        .bodyToMono<ByteArray>()
                        .block() // Timeout auf 100 Sekunden ändern
            } catch (e: Exception) {
                // Fehler beim Polling, erhöhe die Retry-Zahl
                println("❌ Fehler beim Polling-Versuch ${retries + 1}/$maxRetries: ${e.message}")
                retries++
                delay(waittime)
            }
        }

        // Wenn alle Versuche fehlgeschlagen sind, hole das Markdown ohne ZIP
        println("⏳ Polling für Job $jobId überschreitet maximale Versuche, versuche Fallback ohne ZIP.")
        return try {
            fetchMarkdownWithoutZip(jobId).toByteArray()
        } catch (e: Exception) {
            println("❌ Fehler beim Abrufen des Markdowns ohne ZIP: ${e.message}")
            throw RuntimeException("Verarbeitungszeitüberschreitung und kein Fallback möglich: ${e.message}")
        }
    }



    private fun fetchMarkdownWithoutZip(jobId: String): String {
        return try {
            parsrClient
                    .get()
                    .uri("/api/v1/markdown/$jobId")
                    .retrieve()
                    .bodyToMono<String>()
                    .block(Duration.ofSeconds(30))
                    ?: throw RuntimeException("Leere Markdown-Antwort erhalten")
        } catch (e: Exception) {
            println("❌ Fallback ebenfalls fehlgeschlagen: ${e.message}")
            throw e
        }
    }

    fun unzipZip(zipData: ByteArray): String {
        val channel = SeekableInMemoryByteChannel(zipData)
        var markdown: String? = null
        val images = mutableMapOf<String, String>()

        ZipFile(channel).use { zipFile ->
            zipFile.entries.asSequence().forEach { entry ->
                if (entry.isDirectory) return@forEach
                val name = entry.name.lowercase()
                val extension = name.substringAfterLast('.', "")
                zipFile.getInputStream(entry).use { input ->
                    val bytes = input.readBytes()
                    if (extension == "md") {
                        markdown = bytes.decodeToString()
                    } else {
                        val base64 = Base64.getEncoder().encodeToString(bytes)
                        val mime = when (extension) {
                            "png" -> "image/png"
                            "jpg", "jpeg" -> "image/jpeg"
                            else -> "application/octet-stream"
                        }
                        images[name] = "data:$mime;base64,$base64"
                    }
                }
            }
        }

        images.forEach { (key, value) ->
            markdown = markdown?.replace("![]($key)", "![]($value)")
        }

        return markdown ?: throw RuntimeException("No markdown file found in zip")
    }

    fun convertPdfToVersion(file: MultipartFile, targetVersion: Float): ByteArray {
        PDDocument.load(file.inputStream).use { document ->
            document.document.version = targetVersion
            val outputStream = ByteArrayOutputStream()
            document.save(outputStream)
            return outputStream.toByteArray()
        }
    }

    fun documentExists(jobId: String): Boolean {
        return documentCache.containsKey(jobId)
    }
}