package de.thm.ii.fbs.controller

import java.nio.file.Paths
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.util.{ResourceNotFoundException, UnauthorizedException}
import de.thm.ii.fbs.services._
import javax.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.core.io.{Resource, UrlResource}
import org.springframework.http.{HttpHeaders, HttpStatus, ResponseEntity}
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile
import scala.jdk.CollectionConverters._

/**
  * HomeController serve the Angular App and force every non registered "api" route to be a error 404
  *
  * @author Allan Karlson
  */
@RestController
@RequestMapping(path = Array("/api/v1"))
class SubmissionController {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val testsystemService: TestsystemService = null
  @Autowired
  private val taskExtensionService: TaskExtensionService = null
  private var storageService: StorageService = null

  private val logger: Logger = LoggerFactory.getLogger(classOf[SubmissionController])
  @Value("${spring.kafka.bootstrap-servers}")
  private val kafkaURL: String = null
  private final val application_json_value = "application/json"

  private val LABEL_SUCCESS = "success"
  private final val LABEL_FILE = "file"
  private final val LABEL_SEQ = "SEQ"
  private final val LABEL_FILENAME = "filename"
  private val LABEL_DOWNLOAD_NOT_PERMITTED = "Download is not permitted. Please provide a valid jwt."

  @Value("${compile.production}")
  private val compile_production: Boolean = true

  /**
    * Using autowired configuration, they will be loaded after self initialization
    */
  def configurateStorageService(): Unit = {
    if (this.storageService == null) this.storageService = new StorageService(compile_production)
  }

  /**
    * re submit a task, i.e. its submission by the submission id
    * @param taskid the task id
    * @param subid submisison id
    * @param jsonNode json object
    * @param request Request Header containing Headers
    * @return JSON
    */
  @ResponseStatus(HttpStatus.ACCEPTED)
  @RequestMapping(value = Array("tasks/{taskid}/submissions/{subid}/resubmit"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  @ResponseBody
  def reSubmitTask(@PathVariable taskid: Integer, @PathVariable subid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest):
  Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.isPermittedForTask(taskid, requestingUser.get)) throw new UnauthorizedException
    val taskDetailsOpt = taskService.getTaskDetails(taskid)
    if(taskDetailsOpt.isEmpty) throw new ResourceNotFoundException

    val systemList: List[String] = jsonNode.get("testsystems").iterator().asScala.toList.map(_.asText())
    this.submissionService.reSubmitASubmission(subid, taskid, systemList)

    Map(LABEL_SUCCESS -> true)
  }

  /**
    * set a task as passed, i.e. its submission by the submission id
    * @param taskid the task id
    * @param subid submisison id
    * @param jsonNode json object
    * @param request Request Header containing Headers
    * @return JSON
    */
  @ResponseStatus(HttpStatus.OK)
  @RequestMapping(value = Array("tasks/{taskid}/submissions/{subid}/passed"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  @ResponseBody
  def setTaskAsPassed(@PathVariable taskid: Integer, @PathVariable subid: Integer, @RequestBody jsonNode: JsonNode, request: HttpServletRequest):
  Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.isPermittedForTask(taskid, requestingUser.get)) throw new UnauthorizedException
    val taskDetailsOpt = taskService.getTaskDetails(taskid)
    if(taskDetailsOpt.isEmpty) throw new ResourceNotFoundException

    Map(LABEL_SUCCESS -> this.submissionService.setSubmissionAsPassed(subid, taskid))
  }

  /**
    * return the re submission results
    * @param taskid task id
    * @param subid submission id
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{taskid}/submissions/{subid}/resubmit"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getReSubmittedResults(@PathVariable taskid: Integer, @PathVariable subid: Integer,
                            request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty || !this.taskService.isPermittedForTask(taskid, user.get)) {
      throw new UnauthorizedException
    }

    this.submissionService.getReSubmittedResults(subid)
  }

  /**
    * serve a route to upload a submission file to a given submissionid
    * @author grokonez.com, Benjamin Manns
    * @param taskid unique identification for a task
    * @param submissionid unique identification for a submission
    * @param file multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{taskid}/submissions/{submissionid}/file/upload"), method = Array(RequestMethod.POST))
  def handleSubmissionFileUpload(@PathVariable taskid: Int, @PathVariable submissionid: Int,
                                 @RequestParam(LABEL_FILE) file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)
    if (requestingUser.isEmpty || !taskService.hasSubscriptionForTask(taskid, requestingUser.get)) {
      throw new UnauthorizedException
    }
    configurateStorageService()

    var message: Boolean = false
    var filename: String = ""
    try {
      storageService.storeTaskSubmission(file, taskid, submissionid)
      filename = file.getOriginalFilename
      taskService.setSubmissionFilename(submissionid, filename)

      if (this.taskService.getMultiTestModeOfTask(taskid) == LABEL_SEQ) {
        taskService.sendSubmissionToTestsystem(submissionid, taskid, this.taskService.getTestsystemTopicsByTaskId(taskid).head,
          requestingUser.get, LABEL_FILE, null)
      } else {
        this.taskService.getTestsystemTopicsByTaskId(taskid).foreach(tasksystem_id => {
          taskService.sendSubmissionToTestsystem(submissionid, taskid, tasksystem_id,
            requestingUser.get, LABEL_FILE, null)
        })
      }
      message = true

    } catch {
      case e: Exception => {logger.warn(e.toString + e.getMessage)}
    }
    Map(LABEL_SUCCESS -> message, LABEL_FILENAME -> filename)
  }

  /**
    * implement REST route to get students task submission
    *
    * @author Benjamin Manns
    * @param taskid unique task identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("tasks/{taskid}/submissions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissions(@PathVariable taskid: Integer,
                        request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if(!this.taskService.isPermittedForTask(taskid, user.get)){
      throw new UnauthorizedException
    }
    this.taskService.getSubmissionsByTask(taskid)
  }

  /**
    * Get a zipfile of all submission user made for a task
    * @author Benjamin Manns
    * @param taskid unique identification for a task
    * @param request contain request information
    * @return File Ressource to download
    */
  @RequestMapping(value = Array("tasks/{taskid}/submission/users/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfUsersOfOneTask(@PathVariable taskid: Integer,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)

    if ((user.isEmpty || !taskService.isPermittedForTask(taskid, user.get)) && testsystemService.verfiyTestsystemByHeaderToken(request).isEmpty) {
      throw new UnauthorizedException
    }

    val resource = new UrlResource(Paths.get(taskService.zipOfSubmissionsOfUsersFromTask(taskid)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(resource)).body(resource)
    } else {
      throw new RuntimeException("Zip file could not be found.")
    }
  }

  private def httpResponseHeaderValue(resource: Resource) = "attachment; filename=\"" + resource.getFilename + "\""

  /**
    * provide a GET URL to download submitted files for a submission
    * @author Benjamin Manns
    * @param taskid unique taskid identification
    * @param subid unique subid identification
    * @param request contain request information
    * @return HTTP Response contain file
    */
  @GetMapping(Array("tasks/{taskid}/files/submissions/{subid}"))
  @ResponseBody def getSubmitFileByTask(@PathVariable taskid: Int, @PathVariable subid: Int,
                                        request: HttpServletRequest): ResponseEntity[Resource] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    configurateStorageService
    val filename = submissionService.getSubmittedFileBySubmission(subid)
    val file = storageService.loadFileBySubmission(filename, taskid, subid)
    ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, httpResponseHeaderValue(file)).body(file)
  }

  /**
    *
    * get full submission list (mainly submisison ids) of a task and user
    * @param taskid unique taskid identification
    * @param userid unique user identification
    * @param request contain request information
    * @return list of submissions
    */
  @GetMapping(Array("tasks/{taskid}/submissions/{userid}"))
  @ResponseBody def getFullSubmissionOfTaskByUser(@PathVariable taskid: Int, @PathVariable userid: Int,
                                                  request: HttpServletRequest): List[Map[String, Any]] = {
    val testystem = testsystemService.verfiyTestsystemByHeaderToken(request)
    if (testystem.isEmpty) {
      throw new UnauthorizedException(LABEL_DOWNLOAD_NOT_PERMITTED)
    }
    submissionService.getSubmissionsByTaskAndUser(taskid.toString, userid)
  }

  /**
    * get the detailed submission information of a student of a task for this one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param userid unique identification for a user
    * @param taskid unique identification for a task
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("courses/{courseid}/submissions/user/{userid}/task/{taskid}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeStudentTaskSubmissionsMatrixCell(@PathVariable courseid: Int, @PathVariable userid: Int, @PathVariable taskid: Int,
                                          request: HttpServletRequest): Map[String, List[Any]] = {
    // TODO courseid not needed
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!taskService.isPermittedForTask(taskid, user.get) && user.get.roleid > 2 && user.get.userid != userid) {
      throw new UnauthorizedException
    }

    Map("submissions" -> submissionService.getSubmissionsByTaskAndUser(taskid.toString, userid, "desc", true),
      "extended" -> taskExtensionService.getAllExensionsByTask(taskid, userid))
  }
}
