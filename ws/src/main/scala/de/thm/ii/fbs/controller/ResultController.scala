package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.services.checker.`trait`.CheckerServiceHandle
import de.thm.ii.fbs.services.checker.{CheckerServiceFactoryService, RemoteCheckerService}
import de.thm.ii.fbs.services.persistence.CheckerConfigurationService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * Result controller implement routes for submitting results
  */
@RestController
@CrossOrigin
@RequestMapping()
class ResultController {
  @Autowired
  private val checkerServiceFactory: CheckerServiceFactoryService = null
  @Autowired
  private val checkerConfigurationService: CheckerConfigurationService = null

  /**
    * Handles the result request from the runner
    *
    * @param sid     the submission id
    * @param ccid    the checker configuration id
    * @param request the request body
    */
  @PostMapping(value = Array("/results/{sid}/{ccid}", "/api/v1/results/{sid}/{ccid}"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def postResult(@PathVariable("sid") sid: Int, @PathVariable("ccid") ccid: Int, @RequestBody request: JsonNode): Unit = {
    val checkerConfiguration = checkerConfigurationService.getOne(ccid) match {
      case Some(cc) => cc
      case _ => throw new ResourceNotFoundException()
    }
    val checkerService = checkerServiceFactory(checkerConfiguration.checkerType)
    if (!checkerService.isInstanceOf[CheckerServiceHandle]) {
      throw new BadRequestException()
    }

    checkerService.asInstanceOf[CheckerServiceHandle].handle(
      sid, ccid, request.get("exitCode").asInt(0),
      request.get("stdout").asText("") + request.get("stderr").asText(""),
      if (request.hasNonNull("extInfo")) request.get("extInfo").toString else null
    )
  }
}
