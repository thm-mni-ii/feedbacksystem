package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.CheckrunnerConfiguration
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.{CheckerServiceFormatConfiguration, CheckerServiceFormatSubmission}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, StorageService, SubmissionService}
import de.thm.ii.fbs.services.security.TokenService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.{CrossOrigin, GetMapping, PathVariable, RequestMapping, RequestParam, ResponseBody, RestController}

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * Submission controller implement routes for submitting task and receive results
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/checker"))
class CheckerApiController {
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val tokenService: TokenService = null
  @Autowired
  private val checkerServiceFactoryService: CheckerServiceFactoryService = null

  /**
    * Get the content of a submission
    *
    * @param submissionID Submission id
    * @param req          Http request
    * @param res          Http response
    * @return The submission
    */
  @GetMapping(value = Array("/submissions/{submissionID}"))
  @ResponseBody
  def getSubmission(@PathVariable submissionID: Int, @RequestParam token: String, @RequestParam typ: String = "",
                    req: HttpServletRequest, res: HttpServletResponse): Any = {
    if (!tokenService.verify(token).contains(s"submissions/$submissionID")) {
      throw new ForbiddenException()
    }

    val submission = submissionService.getOneWithoutUser(submissionID) match {
      case Some(submission) => submission
      case None => throw new ResourceNotFoundException()
    }

    val ccs = checkerConfigurationService
      .getAllForSubmission(submissionID)
      .map(checker => (checker, checkerServiceFactoryService(checker.checkerType)))
      .filter(checker => checker._2.isInstanceOf[CheckerServiceFormatSubmission])

    val cco = if (ccs.length == 1) {
      ccs.headOption
    } else if (typ != "") {
      ccs.find(checker => checker._1.checkerType == typ)
    } else {
      None
    }
    val (cc, checker) = cco match {
      case Some(cc) => cc
      case _ => throw new BadRequestException()
    }

    var solution: String = ""
    solution = storageService.getSolutionFileContent(cc.isInBlockStorage, submissionID)

    checker.asInstanceOf[CheckerServiceFormatSubmission].formatSubmission(submission, cc, solution)
  }

  @GetMapping(value = Array("/checkers/{checkerID}"))
  @ResponseBody
  def getChecker(@PathVariable checkerID: Int, @RequestParam token: String, @RequestParam typ: String = "",
                 req: HttpServletRequest, res: HttpServletResponse): Any = {
    if (!tokenService.verify(token).contains(s"checkers/$checkerID")) {
      throw new ForbiddenException()
    }

    val cc = checkerConfigurationService.getOne(checkerID) match {
      case Some(cc) => cc
      case None => throw new ResourceNotFoundException()
    }

    checkerServiceFactoryService(cc.checkerType) match {
      case csfc: CheckerServiceFormatConfiguration => csfc.formatConfiguration(cc)
      case _ => throw new BadRequestException()
    }
  }
}
