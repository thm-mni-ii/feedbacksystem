package de.thm.ii.fbs.services.v2.Parsr

import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
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
import org.springframework.security.core.parameters.P
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.file.Paths
import kotlin.io.path.absolutePathString
import kotlin.io.path.outputStream

@Service
class ParsrService {

    enum class ParsrStatus {
        ONGOING,
        FINISHED
    }
    class ParsrStatusEntry(var status: ParsrStatus = ParsrStatus.ONGOING, var markdown: String = "", var rawMarkdown: String = "") {
        fun finish(rawMarkdown: String, markdown: String) {
            this.status = ParsrStatus.FINISHED
            // update rawMarkdown
            val regex = Regex("!\\[([^]]*)]\\((\\S*)\\)")
            var match = regex.find(rawMarkdown)
            var lastIndex = 0
            var result = ""
            while (match != null) {
                if (match.groups[1]!!.value.isNotBlank()) {
                    match = match.next()
                    continue
                }
                if (match.range.first > lastIndex) {
                    result += rawMarkdown.substring(lastIndex, match.range.first)
                }
                val key = match.groups[2]!!.value
                val name = URLDecoder.decode(key, "utf-8")
                result += "![$name]($key)"
                lastIndex = match.range.last + 1
                match = match.next()
            }
            if (lastIndex < rawMarkdown.length) {
                result += rawMarkdown.substring(lastIndex)
            }
            this.rawMarkdown = result
            this.markdown = markdown
        }

        fun verifyRawMarkdown(): String {
            if (this.status != ParsrStatus.FINISHED) {
                throw NotFoundException()
            }
            return this.rawMarkdown
        }

        fun verifyMarkdown(): String {
            if (this.status != ParsrStatus.FINISHED) {
                throw NotFoundException()
            }
            return this.markdown
        }
    }

    private val parsrClient: WebClient = WebClient.builder()
            .baseUrl("http://parsr:3001")
            .codecs { it.defaultCodecs().maxInMemorySize(10 * 1024 * 1024) } // 10 MB
            .build()
    private val documentCache = ConcurrentHashMap<String, ParsrStatusEntry>()
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
            "pdf": { "pages": "1" }
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
        documentCache[jobId] = ParsrStatusEntry()

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
                        val (rawMarkdown, withImages) = unzipZip(zipResult)
                        println("🖼️ Entpacken & Ersetzen der Bilder dauerte ${System.currentTimeMillis() - unzipStart} ms")
                        documentCache[jobId]?.finish(rawMarkdown, withImages)
                        println("✅ Markdown mit Bildern gecacht für Job: $jobId")
                    } catch (e: Exception) {
                        println("⚠️ Fehler beim Entpacken, versuche Nur-Markdown: ${e.message}")
                        val fallback = fetchMarkdownWithoutZip(jobId)
                        documentCache[jobId]?.finish(fallback, fallback)
                    }
                } else {
                    val fallback = fetchMarkdownWithoutZip(jobId)
                    documentCache[jobId]?.finish(fallback, fallback)
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
        val markdown = documentCache[jobId] ?: throw ForbiddenException()
        return markdown.verifyMarkdown()
    }

    fun getRawDocument(jobId: String): String {
        val markdown = documentCache[jobId] ?: throw ForbiddenException()
        return markdown.verifyRawMarkdown()
    }

    private suspend fun pollParsrResult(jobId: String): ByteArray? {
        var retries = 0
        val maxRetries = 150
        val waittime = 1000L

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

    fun unzipZip(zipData: ByteArray): Pair<String, String> {
        val channel = SeekableInMemoryByteChannel(zipData)
        var markdown: String? = null
        val images = mutableMapOf<String, String>()

        ZipFile(channel).use { zipFile ->
            zipFile.entries.asSequence().forEach { entry ->
                if (entry.isDirectory) return@forEach
                val name = entry.name
                val extension = name.lowercase().substringAfterLast('.', "")
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

        val rawMarkdown = markdown ?: throw RuntimeException("No markdown file found in zip")

        val regex = Regex("!\\[([^]]*)]\\((\\S*)\\)")
        var match = regex.find(rawMarkdown)
        var lastIndex = 0
        var result = ""
        while (match != null) {
            if (match.groups[1]!!.value.isNotBlank()) {
                match = match.next()
                continue
            }
            val name = URLDecoder.decode(match.groups[2]!!.value, "utf-8")
            val value = images[name]
            if (value == null) {
                match = match.next()
                continue
            }
            if (match.range.first > lastIndex) {
                result += rawMarkdown.substring(lastIndex, match.range.first)
            }
            result += "![$name]($value)"
            lastIndex = match.range.last + 1
            match = match.next()
        }
        if (lastIndex < rawMarkdown.length) {
            result += rawMarkdown.substring(lastIndex)
        }

        return Pair(rawMarkdown, result)
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