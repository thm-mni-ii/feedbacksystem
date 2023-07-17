package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.model.Course
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.util.JsonWrapper._
import de.thm.ii.fbs.utils.v2.security.authorization.{IsModerator, IsUser}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.access.prepost.{PostAuthorize, PostFilter, PreAuthorize}
import org.springframework.web.bind.annotation._

import java.util
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.jdk.CollectionConverters.SeqHasAsJava

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class CourseController {
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val storageService: StorageService = null

  /**
    * Get a course list
    *
    * @param ignoreHidden optional filter to filter only for visible courses
    * @param req          http request
    * @param res          http response
    * @return course list
    */
  @GetMapping(value = Array(""))
  @ResponseBody
  @IsUser
  @PostFilter("hasRole('MODERATOR') || filterObject.visible || @coursePermissions.hasRole(filterObject.id, 'TUTOR')")
  def getAll(@RequestParam(value = "visible", required = false) ignoreHidden: Boolean,
             req: HttpServletRequest, res: HttpServletResponse): java.util.List[Course] =
    new util.ArrayList[Course](courseService.getAll(false).asJava)


  /**
    * Create a new course
    *
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  @IsModerator
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Course =
    (
      body.retrive("semesterId").asInt(),
      body.retrive("name").asText(),
      body.retrive("description").asText(),
      body.retrive("visible").asBool()
    ) match {
      case (semesterId, Some(name), desc, visible) =>
        courseService.create(Course(name, desc.getOrElse(""), visible.getOrElse(true), semesterId = semesterId))
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Get a single course
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    * @return A course
    */
  @GetMapping(value = Array("/{cid}"))
  @ResponseBody
  @PreAuthorize("hasRole('MODERATOR') || @coursePermissions.subscribed(#cid)")
  @PostAuthorize("returnObject.visible") // TODO filter visibility at db layer
  def getOne(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Course =
    courseService.find(cid) match {
      case Some(course) => course
      case _ => throw new ResourceNotFoundException()
    }

  /**
    * Update course
    *
    * @param cid  Course id
    * @param req  http request
    * @param res  http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{cid}"))
  @PreAuthorize("hasRole('MODERATOR') || @coursePermissions.hasRole(#cid, 'DOCENT')")
  def update(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit =
    (
      body.retrive("semesterId").asInt(),
      body.retrive("name").asText(),
      body.retrive("description").asText(),
      body.retrive("visible").asBool()
    ) match {
      case (semesterId, Some(name), desc, visible) =>
        courseService.update(cid, Course(name, desc.getOrElse(""), visible.getOrElse(true), semesterId = semesterId))
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Delete course
    *
    * @param cid Course id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{cid}"))
  @PreAuthorize("hasRole('MODERATOR') || @coursePermissions.hasRole(#cid, 'DOCENT')")
  def delete(@PathVariable("cid") cid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    // Save submissions and configurations
    val tasks = taskService.getAll(cid).map(t => (submissionService.getAllByTask(cid, t.id), checkerConfigurationService.getAll(cid, t.id)))

    val success = courseService.delete(cid)

    // If the Course was deleted in the database -> delete all files TODO1
    success && tasks.forall(t => t._1
      .forall(s => storageService.deleteSolution(s.id)) && t._2
      .forall(cc => storageService.deleteAllConfigurations(cc.taskId, cid, cc)))
  }
}
