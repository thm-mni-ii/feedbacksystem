package de.thm.ii.fbs.services.v2.Parsr

import java.time.Duration
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.*
import org.apache.commons.compress.archivers.zip.ZipFile
import org.apache.commons.compress.utils.SeekableInMemoryByteChannel
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono

@Service
class ParsrService {
    private val parsrClient: WebClient = WebClient.builder().baseUrl("http://parsr:3001").build()
    private val documentCache = ConcurrentHashMap<String, String>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    fun sendPdfToParsr(file: MultipartFile): String {
        val response =
                parsrClient
                        .post()
                        .uri("/api/v1/document")
                        .contentType(MediaType.MULTIPART_FORM_DATA)
                        .body(BodyInserters.fromMultipartData("file", file.resource))
                        .retrieve()
                        .bodyToMono<String>()
                        .block(Duration.ofSeconds(30))
                        ?: throw RuntimeException("Empty response from Parsr")

        val jobId = response.trim()

        // Asynchrones Polling starten
        coroutineScope.launch {
            try {
                val zipResult = pollParsrResult(jobId)
                try {
                    val withImages = unzipZip(zipResult!!)
                    documentCache[jobId] = withImages
                    println("✅ Markdown mit Bildern gecacht für Job: $jobId")
                } catch (e: Exception) {
                    println("⚠️ Fehler beim Entpacken, versuche Nur-Markdown: ${e.message}")
                    val fallback = fetchMarkdownWithoutZip(jobId)
                    documentCache[jobId] = fallback
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
        val maxRetries = 10
        while (retries < maxRetries) {
            try {
                return parsrClient
                        .get()
                        .uri("/api/v1/markdown/$jobId?download=1")
                        .retrieve()
                        .bodyToMono<ByteArray>()
                        .block(Duration.ofSeconds(15))
            } catch (_: Exception) {
                delay(3000L)
                retries++
            }
        }
        throw RuntimeException("Verarbeitungszeitüberschreitung (${maxRetries * 3}s)")
    }

    private fun fetchMarkdownWithoutZip(jobId: String): String {
        return try {
            parsrClient
                    .get()
                    .uri("/api/v1/markdown/$jobId")
                    .retrieve()
                    .bodyToMono<String>()
                    .block(Duration.ofSeconds(15))
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
                        val mime =
                                when (extension) {
                                    "png" -> "image/png"
                                    "jpg", "jpeg" -> "image/jpeg"
                                    else -> "application/octet-stream"
                                }
                        images[name] = "data:$mime;base64,$base64"
                    }
                }
            }
        }

        images.forEach { (key, value) -> markdown = markdown?.replace("![]($key)", "![]($value)") }

        return markdown ?: throw RuntimeException("No markdown file found in zip")
    }

    fun documentExists(jobId: String): Boolean {
        return documentCache.containsKey(jobId)
    }
}
