package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.services.persistence.{CheckerConfigurationService, StorageService, SubmissionService}
import de.thm.ii.fbs.services.security.TokenService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, RequestMapping, RequestParam, ResponseBody, RestController}

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Submission controller implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/submissions"))
class SubmissionDataController {
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val tokenService: TokenService = null

  /**
    * Get the content of a submission
    * @param submissionID Submission id
    * @param req Http request
    * @param res Http response
    * @return The submission
    */
  @GetMapping(value = Array("/{submissionID}"))
  @ResponseBody
  def getOne(@PathVariable submissionID: Int, @RequestParam token: String, @RequestParam typ: String = "raw",
             req: HttpServletRequest, res: HttpServletResponse): String = {
    if (!tokenService.verify(token).contains(s"submissions/$submissionID")) {
      throw new ForbiddenException()
    }

    val submission = submissionService.getOneWithoutUser(submissionID) match {
      case Some(submission) => submission
      case None => throw new ResourceNotFoundException()
    }

    val soluion = storageService.getSolutionFile(submissionID)
    typ match {
      case "raw" => soluion
      case "sql-checker" =>
        new ObjectMapper().createObjectNode()
          .put("passed", false)
          .put("userid", submission.userID.get)
          .put("attempt", 0)
          .put("submission", soluion)
          .toString
      case _ => throw new BadRequestException()
    }
  }
}
