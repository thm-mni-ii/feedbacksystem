package de.thm.ii.fbs.services.v2.Parsr

import kotlinx.coroutines.*
import kotlinx.serialization.json.Json
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.bodyToMono
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

@Service
class ParsrService {
    private val parsrClient: WebClient = WebClient.builder()
        .baseUrl("http://parsr:3001")
        .build()

    // Thread-sicherer Cache mit ConcurrentHashMap
    private val documentCache = ConcurrentHashMap<String, String>()
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    fun sendPdfToParsr(file: MultipartFile): String {
        val response = parsrClient.post()
            .uri("/api/v1/document")
            .contentType(MediaType.MULTIPART_FORM_DATA)
            .body(BodyInserters.fromMultipartData("file", file.resource))
            .retrieve()
            .bodyToMono<String>()
            .block(Duration.ofSeconds(30)) ?: throw RuntimeException("Empty response from Parsr")

        val jobId = response.trim()

        // Asynchrones Polling starten
        coroutineScope.launch {
            try {
                val markdown = pollParsrResult(jobId)
                documentCache[jobId] = markdown
                println("Successfully cached markdown for job: $jobId")
            } catch (e: Exception) {
                println("Failed to cache markdown for job $jobId: ${e.message}")
                documentCache.remove(jobId)
            }
        }

        return jobId
    }

    fun getParsedDocument(jobId: String): String {
        return documentCache[jobId] ?: throw RuntimeException("Document not found")
    }

    private suspend fun pollParsrResult(jobId: String): String {
    var retries = 0
    val maxRetries = 30 // 40 Sekunden bei 2s-Intervallen
    while (retries < maxRetries) {
        try {
            val result = parsrClient.get()
                .uri("/api/v1/markdown/$jobId")
                .retrieve()
                .bodyToMono<String>()
                .block(Duration.ofSeconds(20)) ?: ""
            
            if (result.isNotBlank()) return result
        } catch (e: Exception) {
            delay(3000L)
        }
        retries++
    }
    throw RuntimeException("Verarbeitungszeitüberschreitung (${maxRetries*2}s)")
    }

    fun documentExists(jobId: String): Boolean {
        return documentCache.containsKey(jobId)
    }

}
