package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.services.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.checker.`trait`.CheckerServiceHandle
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, SubmissionService, TaskService}
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
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkrunnerSubTaskService: CheckrunnerSubTaskService = null

  /**
    * Handles the result request from the runner or TaskProvider
    *
    * @param sid     the submission id
    * @param ccid    the checker configuration id
    * @param request the request body
    */
  @PostMapping(value = Array("/results/{sid}/{ccid}", "/api/v1/results/{sid}/{ccid}"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def postResult(@PathVariable("sid") sid: Int, @PathVariable("ccid") ccid: Int, @RequestBody request: JsonNode): Unit = {
    val submission = submissionService.getOneWithoutUser(sid) match {
      case Some(submission) => submission
      case _ => throw new ResourceNotFoundException()
    }
    val checkerConfiguration = checkerConfigurationService.getOne(ccid) match {
      case Some(cc) => cc
      case _ => throw new ResourceNotFoundException()
    }
    val task = taskService.getOne(checkerConfiguration.taskId).get
    val checkerService = checkerServiceFactory(checkerConfiguration.checkerType)
    if (!checkerService.isInstanceOf[CheckerServiceHandle]) {
      throw new BadRequestException()
    }

    val exitCode = if (request.hasNonNull("exitCode")) request.get("exitCode").asInt(0) else 0
    val resultText = extractResultText(request)
    val extInfo = if (request.hasNonNull("extInfo")) request.get("extInfo").toString else null

    processSubtasks(request, checkerConfiguration.id, submission.id)

    checkerService.asInstanceOf[CheckerServiceHandle].handle(
      submission, checkerConfiguration, task, exitCode,
      resultText,
      extInfo
    )
  }

  private def extractResultText(request: JsonNode): String = {
    if (request.hasNonNull("resultText")) {
      request.get("resultText").asText("")
    } else {
      val stdout = if (request.hasNonNull("stdout")) request.get("stdout").asText("") else ""
      val stderr = if (request.hasNonNull("stderr")) request.get("stderr").asText("") else ""
      stdout + stderr
    }
  }

  private def processSubtasks(request: JsonNode, ccid: Int, sid: Int): Unit = {
    if (request.hasNonNull("subtasks") && request.get("subtasks").isArray) {
      val subtasksNode = request.get("subtasks")
      for (i <- 0 until subtasksNode.size()) {
        val stNode = subtasksNode.get(i)
        val stName = if (stNode.hasNonNull("name")) stNode.get("name").asText(s"Subtask ${i + 1}") else s"Subtask ${i + 1}"
        val pointsAchieved = if (stNode.hasNonNull("pointsAchieved")) {
          stNode.get("pointsAchieved").asInt(0)
        } else if (stNode.hasNonNull("passed") && stNode.get("passed").asBoolean()) {
          1
        } else {
          0
        }
        val pointsMax = if (stNode.hasNonNull("pointsMax")) stNode.get("pointsMax").asInt(1) else 1

        val subTask = checkrunnerSubTaskService.getOrCrate(ccid, stName, pointsMax)
        checkrunnerSubTaskService.getResult(ccid, subTask.subTaskId, sid) match {
          case Some(_) => ()
          case None => checkrunnerSubTaskService.createResult(ccid, subTask.subTaskId, sid, pointsAchieved)
        }
      }
    }
  }
}
