@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.services.v2.Parsr

import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
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
import java.io.ByteArrayOutputStream
import java.net.URLDecoder
import java.time.Duration
import java.util.Base64
import java.util.concurrent.ConcurrentHashMap

@Service
class ParsrService {

    enum class ParsrStatus {
        ONGOING, FINISHED
    }

    class ParsrStatusEntry(
        var status: ParsrStatus = ParsrStatus.ONGOING,
        var markdown: String = "",
        var rawMarkdown: String = ""
    ) {
        fun finish(rawMarkdown: String, markdown: String) {
            this.status = ParsrStatus.FINISHED
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

        fun verifyMarkdown(): String {
            if (this.status != ParsrStatus.FINISHED) throw NotFoundException()
            return this.markdown
        }

        fun verifyRawMarkdown(): String {
            if (this.status != ParsrStatus.FINISHED) throw NotFoundException()
            return this.rawMarkdown
        }
    }

    private val parsrClient: WebClient = WebClient.builder()
        .baseUrl("http://parsr:3001")
        .codecs { it.defaultCodecs().maxInMemorySize(10 * 1024 * 1024) }
        .build()

    private val documentCache = ConcurrentHashMap<String, ParsrStatusEntry>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    fun sendPdfToParsr(file: MultipartFile): String {
        val pagesPerChunk = 5
        val document = PDDocument.load(file.inputStream)
        val totalPages = document.numberOfPages
        val jobId = System.currentTimeMillis().toString()
        documentCache[jobId] = ParsrStatusEntry()

        coroutineScope.launch {
            val semaphore = Semaphore(5)

            try {
                val resultsWithRaw = supervisorScope {
                    (0 until totalPages step pagesPerChunk).map { startPage ->
                        async {
                            semaphore.withPermit {
                                try {
                                    val endPage = minOf(startPage + pagesPerChunk, totalPages)
                                    val chunk = PDDocument()
                                    for (i in startPage until endPage) {
                                        chunk.addPage(document.getPage(i))
                                    }

                                    val chunkBytes = ByteArrayOutputStream().also { chunk.save(it) }.toByteArray()
                                    chunk.close()

                                    val chunkJobId = uploadChunkToParsr(chunkBytes)
                                    val resultBytes = pollParsrResult(chunkJobId, pagesPerChunk)

                                    if (resultBytes != null && isZip(resultBytes)) {
                                        unzipZip(resultBytes)
                                    } else if (resultBytes != null) {
                                        val fallback = resultBytes.decodeToString()
                                        Pair(fallback, fallback)
                                    } else {
                                        val fallback = fetchMarkdownWithoutZip(chunkJobId)
                                        Pair(fallback, fallback)
                                    }
                                } catch (e: Exception) {
                                    throw RuntimeException("Chunk [$startPage] konnte nicht verarbeitet werden", e)
                                }
                            }
                        }
                    }.awaitAll()
                }

                document.close()

                val rawResults = resultsWithRaw.map { it.first }.filter { it.isNotBlank() }
                val results = resultsWithRaw.map { it.second }.filter { it.isNotBlank() }

                if (results.isEmpty()) throw RuntimeException("Kein Chunk konnte erfolgreich verarbeitet werden.")

                val combinedRaw = rawResults.joinToString("\n\n")
                val combinedMarkdown = results.joinToString("\n\n")
                documentCache[jobId]?.finish(combinedRaw, combinedMarkdown)
            } catch (e: Exception) {
                println("Fehler bei der PDF-Verarbeitung für Job $jobId: ${e.message}")
                document.close()
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

    private fun uploadChunkToParsr(pdfChunk: ByteArray): String {
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
                "output": { "format": "markdown" }
            }
        """.trimIndent()

        val resource = object : ByteArrayResource(pdfChunk) {
            override fun getFilename(): String = "chunk.pdf"
        }

        val multipartData = LinkedMultiValueMap<String, Any>().apply {
            add("file", resource)
            add("config", configJson)
        }

        return parsrClient
            .post()
            .uri("/api/v1/document")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(BodyInserters.fromMultipartData(multipartData))
            .retrieve()
            .bodyToMono<String>()
            .block(Duration.ofSeconds(120))
            ?.trim()
            ?: throw RuntimeException("Leere Antwort beim Chunk-Upload erhalten")
    }

    private suspend fun pollParsrResult(jobId: String, numpages: Int): ByteArray? {
        var retries = 0
        val maxRetries = 10 * numpages
        val waittime = 1000L

        while (retries < maxRetries) {
            try {
                return parsrClient
                    .get()
                    .uri("/api/v1/markdown/$jobId?download=1")
                    .retrieve()
                    .bodyToMono<ByteArray>()
                    .block()
            } catch (e: Exception) {
                retries++
                delay(waittime)
            }
        }

        return try {
            fetchMarkdownWithoutZip(jobId).toByteArray()
        } catch (e: Exception) {
            throw RuntimeException("Verarbeitungszeitüberschreitung und kein Fallback möglich: ${e.message}")
        }
    }

    private fun fetchMarkdownWithoutZip(jobId: String): String {
        return parsrClient
            .get()
            .uri("/api/v1/markdown/$jobId")
            .retrieve()
            .bodyToMono<String>()
            .block(Duration.ofSeconds(30))
            ?: throw RuntimeException("Leere Markdown-Antwort erhalten")
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

    fun isZip(data: ByteArray): Boolean {
        return data.size > 4 &&
            data[0] == 0x50.toByte() &&
            data[1] == 0x4B.toByte() &&
            data[2] == 0x03.toByte() &&
            data[3] == 0x04.toByte()
    }
}
