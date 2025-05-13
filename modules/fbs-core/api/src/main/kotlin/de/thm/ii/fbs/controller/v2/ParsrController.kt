package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.services.v2.Parsr.ParsrService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.http.MediaType
import org.springframework.http.HttpStatus


@RestController
@RequestMapping(path = ["/api/v2/parsr"])
class ParsrController(
    private val parsrService: ParsrService
) {
    @PostMapping(
        "/upload",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]
    )
    fun uploadPdf(@RequestPart("file") file: MultipartFile): ResponseEntity<String> {
        val jsonResponse = parsrService.sendPdfToParsr(file)
        return ResponseEntity.ok(jsonResponse)
    }

    @GetMapping("/document/{jobId}/json")
    fun getDocument(@PathVariable jobId: String): ResponseEntity<String> {
        return try {
            val document = parsrService.getParsedDocument(jobId)
            ResponseEntity.ok(document)
        } catch (e: Exception) {
            e.printStackTrace()
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Dokument nicht gefunden: ${e.message}")
        }
    }

    @GetMapping("/document/{jobId}/markdown")
    fun getMarkdownDocument(@PathVariable jobId: String): ResponseEntity<String> {
        val document = parsrService.getRawDocument(jobId)
        return ResponseEntity.ok(document)
    }

    @GetMapping("/document/{jobId}/markdownWithImages")
    fun getMarkdownWithImages(@PathVariable jobId: String): ResponseEntity<String> {
        val document = parsrService.getParsedDocument(jobId)
        return ResponseEntity.ok(document)
    }


    @GetMapping("/test")
    @ResponseBody
    fun test(): String = "Hello World"
}