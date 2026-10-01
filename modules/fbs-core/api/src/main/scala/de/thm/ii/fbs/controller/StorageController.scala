package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.{ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, SubmissionService}
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.v2.security.ScopedTaskTokenService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

import java.io.FileInputStream

/**
  * Storage controller for downloading submission and checker configuration files
  * securely for Task Providers and checkers.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/storage"))
class StorageController {
  @Autowired
  private val scopedTaskTokenService: ScopedTaskTokenService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  @GetMapping(value = Array("/submissions/{sid}/file"))
  def getSubmissionFile(
    @PathVariable("sid") sid: Int,
    @RequestParam(name = "token", required = false) tokenParam: String,
    @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) authHeader: String
  ): ResponseEntity[InputStreamResource] = {
    val token = extractToken(tokenParam, authHeader)
    if (!scopedTaskTokenService.validateSubmissionToken(token, sid)) {
      throw new ForbiddenException()
    }

    val submission = submissionService.getOneWithoutUser(sid) match {
      case Some(s) => s
      case None => throw new ResourceNotFoundException()
    }

    val file = storageService.getFileSolutionFile(submission)
    val mediaType = try {
      MediaType.parseMediaType(storageService.getContentTypeSolutionFile(submission))
    } catch {
      case _: Exception => MediaType.APPLICATION_OCTET_STREAM
    }

    ResponseEntity.ok()
      .contentType(mediaType)
      .contentLength(file.length())
      .header(HttpHeaders.CONTENT_DISPOSITION, s"""attachment; filename="submission_$sid"""")
      .body(new InputStreamResource(new FileInputStream(file)))
  }

  @GetMapping(value = Array("/checkers/{ccid}/primary-file"))
  def getCheckerPrimaryFile(
    @PathVariable("ccid") ccid: Int,
    @RequestParam(name = "token", required = false) tokenParam: String,
    @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) authHeader: String
  ): ResponseEntity[InputStreamResource] = {
    val token = extractToken(tokenParam, authHeader)
    if (!scopedTaskTokenService.validateCheckerConfigToken(token, ccid)) {
      throw new ForbiddenException()
    }

    val config = checkerConfigurationService.getOne(ccid) match {
      case Some(c) if c.mainFileUploaded => c
      case _ => throw new ResourceNotFoundException()
    }

    val file = storageService.getFileMainFile(config)
    val fileName = Option(config.mainFileName).getOrElse("primary-file")

    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(file.length())
      .header(HttpHeaders.CONTENT_DISPOSITION, s"""attachment; filename="$fileName"""")
      .body(new InputStreamResource(new FileInputStream(file)))
  }

  @GetMapping(value = Array("/checkers/{ccid}/secondary-file"))
  def getCheckerSecondaryFile(
    @PathVariable("ccid") ccid: Int,
    @RequestParam(name = "token", required = false) tokenParam: String,
    @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) authHeader: String
  ): ResponseEntity[InputStreamResource] = {
    val token = extractToken(tokenParam, authHeader)
    if (!scopedTaskTokenService.validateCheckerConfigToken(token, ccid)) {
      throw new ForbiddenException()
    }

    val config = checkerConfigurationService.getOne(ccid) match {
      case Some(c) if c.secondaryFileUploaded => c
      case _ => throw new ResourceNotFoundException()
    }

    val file = storageService.getFileScondaryFile(config)
    val fileName = Option(config.secondaryFileName).getOrElse("secondary-file")

    ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_OCTET_STREAM)
      .contentLength(file.length())
      .header(HttpHeaders.CONTENT_DISPOSITION, s"""attachment; filename="$fileName"""")
      .body(new InputStreamResource(new FileInputStream(file)))
  }

  private def extractToken(tokenParam: String, authHeader: String): String = {
    if (tokenParam != null && tokenParam.nonEmpty) {
      tokenParam
    } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
      authHeader.substring(7).trim
    } else {
      throw new ForbiddenException()
    }
  }
}
