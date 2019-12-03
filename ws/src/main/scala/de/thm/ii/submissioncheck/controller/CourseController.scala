package de.thm.ii.submissioncheck.controller

import java.io.{BufferedWriter, FileWriter}
import java.nio.file.{Files, Path, Paths}
import java.time.format.DateTimeFormatter
import java.util.{Timer, TimerTask}
import java.{io, util}
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc._
import de.thm.ii.submissioncheck.services._
import javax.servlet.http.HttpServletRequest
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.SmartInitializingSingleton
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Bean
import org.springframework.core.io.UrlResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation._
import org.springframework.web.multipart.MultipartFile

import scala.collection.mutable.ListBuffer

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@RequestMapping(path = Array("/api/v1/courses"))
class CourseController {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val courseService: CourseService = null
  @Autowired
  private val courseParamService: CourseParamService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val courseParameterService: CourseParamService = null
  @Autowired
  private val testsystemService: TestsystemService = null
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val kafkaTemplate: KafkaTemplate[String, String] = null
  private val topicName: String = "check_request"

  @Value("${compile.production}")
  private val compile_production: Boolean = true

  private val logger: Logger = LoggerFactory.getLogger(classOf[ClientService])
  private final val application_json_value = "application/json"
  private final val PATH_LABEL_ID = "id"
  private final val PATH_REST_LABEL_ID = "{id}"
  private final val LABEL_NAME = "name"
  private final val LABEL_USERID = "userid"
  private final val LABEL_DESCRIPTION = "description"
  private final val PLEASE_PROVIDE_COURSE_LABEL = "Please provide: name, description, standard_task_typ, " +
    " personalised_submission. The parameter course_semester, course_modul_id and course_end_date are optional"
  private val LABEL_SUCCESS = "success"
  private val LABEL_ZIP_NOT_FOUND = "Zip file could not be found."
  private var storageService: StorageService = null

  /**
    * Using autowired configuration, they will be loaded after self initialization
    */
  def configurateStorageService(): Unit = {
    this.storageService = new StorageService(compile_production)
  }

  /**
    * After autowiring initialize storage service
    * @return timer run
    */
  @Bean
  def importStorageProcessor: SmartInitializingSingleton = () => {
    /** wait 3 seconds to be sure everything is connected like it should*/
    val bean_delay = 300
    new Timer().schedule(new TimerTask() {
      override def run(): Unit = {
        configurateStorageService
      }
    }, bean_delay)
  }

  /**
    * getAllCourses is a route for all courses
    * @param hiddenCourses returns also hidden courses if set true
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllCourses(@RequestParam(value = "hiddenCourses", required = false) hiddenCourses: Boolean,
                     request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
        throw new UnauthorizedException
    }
    courseService.getAllKindOfCoursesByUser(user.get, hiddenCourses)
  }

  /**
    * createCourse is a route to create a course
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def createCourse(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 2) { // only ADMIN or MODERATOR can create a course
      throw new UnauthorizedException
    }
    try {
      val name = jsonNode.get(LABEL_NAME).asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      val standard_task_typ = jsonNode.get("standard_task_typ").asText()
      val course_semester = if (jsonNode.get("course_semester") != null) jsonNode.get("course_semester").asText() else null
      val course_modul_id = if (jsonNode.get("course_modul_id") != null) jsonNode.get("course_modul_id").asText() else null
      var course_end_date = if (jsonNode.get(CourseDBLabels.course_end_date) != null) jsonNode.get(CourseDBLabels.course_end_date).asText() else null
      if (course_end_date == "") {
        course_end_date = null
      }
      val personalised_submission = jsonNode.get(CourseDBLabels.personalised_submission).asInt()
      try {
        if (course_end_date != null){
          val dateParsed = DateParser.dateParser(course_end_date)
          if (dateParsed != null) {
            course_end_date = dateParsed.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
          }
        }

        this.courseService.createCourseByUser(user.get, name, description, standard_task_typ, course_modul_id, course_semester,
          course_end_date, personalised_submission)
      } catch {
        case _: Exception => throw new BadRequestException("Please provide a valid course_end_date")
      }
    } catch {
      case _: NullPointerException => throw new BadRequestException(PLEASE_PROVIDE_COURSE_LABEL)
    }
  }

  /**
    * getAllCourse provides all courses for searching purpose
    *
    * @author Benjamin Manns
    * @param hiddenCourses returns also hidden courses if set true
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("all"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getAllCourse(@RequestParam(value = "hiddenCourses", required = false) hiddenCourses: Boolean,
                   request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getAllCourses(user.get, hiddenCourses)
  }

  /**
    * getCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[_ <: String, _ >: io.Serializable with String] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    courseService.getCourseDetails(courseid, user.get).getOrElse(Map.empty)
  }

  /**
    * Generates a zip of one user submissions of one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param userid unique user identification
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param request Request Header containing Headers
    * @return Zip File
    */
  @RequestMapping(value = Array("{courseid}/submission/users/{userid}/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfOneUserFromAllCourses(@PathVariable courseid: Integer, @PathVariable userid: Int,
                                          @RequestParam(value = "only_last_try", required = false) only_last_try: Boolean = true,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || (!courseService.isDocentForCourse(courseid, user.get) && user.get.userid != userid)) {
      throw new UnauthorizedException
    }

    val requestedUser = userService.loadUserFromDB(userid)
    if (requestedUser.isEmpty) {
      throw new ResourceNotFoundException
    }

    val resource = new UrlResource(Paths.get(courseService.zipOfSubmissionsOfUserFromCourse(only_last_try, courseid, requestedUser.get)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader(resource.getFilename)).body(resource)
    } else {
      throw new RuntimeException(LABEL_ZIP_NOT_FOUND)
    }
  }

  private def buildAttachmentHeader(filename: String): String = "attachment; filename=\"" + filename + "\""

  /**
    * Generates a zip of all user submissions  of one course
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param only_last_try if enabled, we only inlcude the last submission of the user
    * @param request Request Header containing Headers
    * @return Zip File
    */
  @RequestMapping(value = Array("{courseid}/submission/users/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getZipOfSubmissionsOfUserFromCourse(@PathVariable courseid: Integer,
                                          @RequestParam(value = "only_last_try", required = false) only_last_try: Boolean = true,
                                          request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)

    if ((user.isEmpty || !courseService.isDocentForCourse(courseid, user.get)) && user.get.roleid > 4
      && testsystemService.verfiyTestsystemByHeaderToken(request).isEmpty) {
      throw new UnauthorizedException
    }

    val resource = new UrlResource(Paths.get(courseService.zipOfSubmissionsOfUsersFromCourse(only_last_try, courseid)).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader(resource.getFilename)).body(resource)
    } else {
      throw new RuntimeException(LABEL_ZIP_NOT_FOUND)
    }
  }

  /**
    * Generates a zip of all course data
    * @author Benjamin Manns
    *
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return Zip File
    */
  @RequestMapping(value = Array("{courseid}/export/zip"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getCompleteReusableExportOfCourse(@PathVariable courseid: Integer, request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)

    if ((user.isEmpty || !courseService.isDocentForCourse(courseid, user.get)) && user.get.roleid > 4
      && testsystemService.verfiyTestsystemByHeaderToken(request).isEmpty) {
      throw new UnauthorizedException
    }

    val resource = new UrlResource(courseService.exportCourseImportable(courseid).toUri)

    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader(resource.getFilename)).body(resource)
    } else {
      throw new RuntimeException(LABEL_ZIP_NOT_FOUND)
    }
  }

  /**
    * recover a course based by uploading a zip file
    * @param courseid unique course identification
    * @param file multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return if recover worked out
    */
  @RequestMapping(value = Array("{courseid}/recover"), method = Array(RequestMethod.POST))
  def recoverACourse(@PathVariable courseid: Int,
                                    @RequestParam file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)

    if (requestingUser.isEmpty || !courseService.isPermittedForCourse(courseid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    val storagePath = storageService.storeZipImportFile(file)
    val filename = file.getOriginalFilename

    Map(LABEL_SUCCESS -> courseService.recoverACourse(courseid, storagePath.resolve(filename)))
  }

  /**
    * import and create a new course based by uploading a zip file
    * @param file multipart binary file in a form data format
    * @param request Request Header containing Headers
    * @return if import worked out
    */
  @RequestMapping(value = Array("/import"), method = Array(RequestMethod.POST))
  def importANewCourse(@RequestParam file: MultipartFile, request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)

    if (requestingUser.isEmpty || requestingUser.get.roleid > 4) {
      throw new UnauthorizedException
    }

    val storagePath = storageService.storeZipImportFile(file)
    val filename = file.getOriginalFilename

    Map(LABEL_SUCCESS -> courseService.importACourse(storagePath.resolve(filename)))
  }

  /**
    * deleteCourse provides course details for a specific course by given id
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.DELETE), consumes = Array())
  @ResponseBody
  def deleteCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty) {
      throw new UnauthorizedException
    }
    if (user.get.roleid > 2) { // Only moderator and admin can delete a course
      throw new UnauthorizedException
    }
    courseService.deleteCourse(courseid)
  }

  /** hack to fix scalas strange cyclomatic behaviour*/
  private def updateCourseParser(jsonNode: JsonNode) = {
    val name = if (jsonNode.get(LABEL_NAME) != null) jsonNode.get(LABEL_NAME).asText() else null
    val description = if (jsonNode.get(LABEL_DESCRIPTION) != null) jsonNode.get(LABEL_DESCRIPTION).asText() else null
    val standard_task_typ = if (jsonNode.get(CourseDBLabels.standard_task_typ) != null) jsonNode.get(CourseDBLabels.standard_task_typ).asText() else null
    val course_semester = if (jsonNode.get(CourseDBLabels.course_semester) != null) jsonNode.get(CourseDBLabels.course_semester).asText() else null
    val course_modul_id = if (jsonNode.get(CourseDBLabels.course_modul_id) != null) jsonNode.get(CourseDBLabels.course_modul_id).asText() else null
    var course_end_date = if (jsonNode.get(CourseDBLabels.course_end_date) != null) jsonNode.get(CourseDBLabels.course_end_date).asText() else null
    if (course_end_date == "") {
      course_end_date = null
    }
    val personalised_submission = if (jsonNode.get(CourseDBLabels.personalised_submission) != null) {
      jsonNode.get(CourseDBLabels.personalised_submission).asBoolean().toString
    } else {
      null
    }
    (name, description, standard_task_typ, course_semester, course_modul_id, course_end_date, personalised_submission)
  }

  /**
    * updateCourse updates course details for a specific course by given id
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode Request Body
    * @return JSON
    */
  @RequestMapping(value = Array(PATH_REST_LABEL_ID), method = Array(RequestMethod.PUT), consumes = Array())
  @ResponseBody
  def updateCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)

    if(user.isEmpty || !this.courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    try {
      val parsedJsonNode = updateCourseParser(jsonNode)
      val name = parsedJsonNode._1
      val description = parsedJsonNode._2
      val standard_task_typ = parsedJsonNode._3
      val course_semester = parsedJsonNode._4
      val course_modul_id = parsedJsonNode._5
      val course_end_date = parsedJsonNode._6
      val personalised_submission = parsedJsonNode._7
      this.courseService.updateCourse(courseid, name, description, standard_task_typ, course_modul_id, course_semester,
        course_end_date, personalised_submission)
    } catch {
      case _: Exception => throw new BadRequestException("Please provide a valid course_end_date")
    }
  }
  /**
    * subscribe a user to a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/subscribe"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def subscribeCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    // TODO here one can make some password protection or something else protection
    this.courseService.subscribeCourse(courseid, user.get)
  }

  /**
    * unsubscribe a user from a course
    *
    * @author Benjamin Manns
    * @param courseid unique identification for a course
    * @param request contain request information
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/unsubscribe"), method = Array(RequestMethod.POST), consumes = Array(application_json_value))
  def unsubscribeCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    this.courseService.unsubscribeCourse(courseid, user.get)
  }

  /**
    * grantTutorToCourse allows a course docent to give access as tutor
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant/tutor"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def grantTutorToCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val userid = jsonNode.get(LABEL_USERID).asInt()
      val user = userService.verifyUserByHeaderToken(request)
      if (user.isEmpty || (!courseService.isDocentForCourse(courseid, user.get) && user.get.roleid > 1)) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(userid)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provid a valid userid")
      }
      courseService.grandUserAsTutorForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: userid to grant user as tutor")
    }
  }

  /**
    * grantDocentToCourse allows a moderator to grand user as a docent for a course
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/grant/docent"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def grantDocentToCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest,
                          @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val userid = jsonNode.get(LABEL_USERID).asInt()
      val requestingUser = userService.verifyUserByHeaderToken(request)
      if (requestingUser.isEmpty || requestingUser.get.roleid > 2) { // Only moderator and admin can do this
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(userid)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid userid as a docent")
      }
      courseService.grandUserAsDocentForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide userid to grant docent")
    }
  }

  /**
    * denyTutorToCourse allows a course docent (and moderator) to give access as tutor
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/deny/tutor"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def denyTutorForCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val userid = jsonNode.get(LABEL_USERID).asInt()
      val user = userService.verifyUserByHeaderToken(request)
      if (user.isEmpty || (!courseService.isDocentForCourse(courseid, user.get) && user.get.roleid > 4)) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(userid)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid userid which is a tutor")
      }
      courseService.denyUserAsTutorForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: userid")
    }
  }

  /**
    * denyDocentForCourse allows moderator to deny a course docent
    * @param courseid unique identification for a course
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/deny/docent"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def denyDocentForCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest,
                          @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val userid = jsonNode.get(LABEL_USERID).asInt()
      val user = userService.verifyUserByHeaderToken(request)
      if (user.isEmpty || user.get.roleid > 2) {
        throw new UnauthorizedException
      }
      val userToGrant = userService.loadUserFromDB(userid)
      if (userToGrant.isEmpty) {
        throw new BadRequestException("Please provide a valid userid which is a docent")
      }
      courseService.denyUserAsDocentForACourse(courseid, userToGrant.get)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: userid")
    }
  }

  /**
    * Implements the REST route for docents who want to get all results of all users of all tasks
    *
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{id}/submissions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissions(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): List[Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!this.courseService.isDocentForCourse(courseid, user.get) && user.get.roleid > 2) {
      throw new UnauthorizedException
    }
    // old version
    // this.courseService.getAllSubmissionsFromAllUsersByCourses(courseid)
    this.courseService.getSubmissionsMatrixByCourse(courseid)
  }

  /**
    * Docents who want to get all results of all users of all tasks as CSV
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return FILE
    */
  @RequestMapping(value = Array("{id}/submissions/csv"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissionsAsCSV(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest): ResponseEntity[UrlResource] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) throw new UnauthorizedException

    if (!this.courseService.isDocentForCourse(courseid, user.get) && user.get.roleid > 2) {
      throw new UnauthorizedException
    }

    submissionService.generateSubmissionCSV(courseid)
  }

  /**
    * @author Benjamin Manns
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return Success JSON
    */
  @RequestMapping(value = Array("{id}/visibility"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def setVisibilityForCourse(@PathVariable(PATH_LABEL_ID) courseid: Integer, request: HttpServletRequest,
                          @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    try {
      val visibilityType = jsonNode.get("typ").asText()
      val user = userService.verifyUserByHeaderToken(request)

      if (user.isEmpty || (user.get.roleid > 2 && !courseService.isPermittedForCourse(courseid, user.get))) {
        throw new UnauthorizedException
      }
      courseService.setVisibilityForCourse(courseid, visibilityType)
    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: typ")
    }
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
  @RequestMapping(value = Array("{courseid}/submissions/user/{userid}/task/{taskid}"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeStudentTaskSubmissionsMatrixCell(@PathVariable courseid: Int, @PathVariable userid: Int, @PathVariable taskid: Int,
                                          request: HttpServletRequest): List[Any] = {
    // TODO courseid not needed
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    if (!taskService.isPermittedForTask(taskid, user.get) && user.get.roleid > 2 && user.get.userid != userid) {
      throw new UnauthorizedException
    }

    submissionService.getSubmissionsByTaskAndUser(taskid.toString, userid, "desc")
  }

  /**
    * get a List of all submissions and information from which course
    * @author Benjamin Manns
    * @param request request Request Header containing Headers for Authorization
    * @return JSON of all submissions
    */
  @RequestMapping(value = Array("submissions"), method = Array(RequestMethod.GET))
  @ResponseBody
  def seeAllSubmissions(request: HttpServletRequest): List[Any] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty) {
      throw new UnauthorizedException
    }
    // old version
    // this.courseService.getAllSubmissionsForAllCoursesByUser(user.get)

    this.courseService.getSubmissionsMatrixByUser(user.get.userid)
  }

  /**
    * get all course parameter
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getAllCourseParameter(@PathVariable courseid: Int, request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || (!courseService.isPermittedForCourse(courseid, user.get) && !courseService.isSubscriberForCourse(courseid, user.get))) {
      throw new UnauthorizedException
    }
    courseParamService.getAllCourseParams(courseid)
  }

  /**
    * set  / update a course parameter (for docent and so on)
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters"), method = Array(RequestMethod.POST))
  @ResponseBody
  def addNewCourseParameter(@PathVariable courseid: Int, request: HttpServletRequest,
                            @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    try {
      val key = jsonNode.get("key").asText()
      val description = jsonNode.get(LABEL_DESCRIPTION).asText()
      courseParamService.setCourseParams(courseid, key, description)

    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: key and description")
    }
  }

  /**
    * delete a course parameter
    * @param courseid unique course identification
    * @param key parameter key
    * @param request Request Header containing Headers
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters/{key}"), method = Array(RequestMethod.DELETE))
  @ResponseBody
  def addNewCourseParameter(@PathVariable courseid: Int, @PathVariable key: String, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isPermittedForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }

    courseParamService.deleteCourseParams(courseid, key)
  }

  /**
    * set course parameters of user
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters/users"), method = Array(RequestMethod.POST))
  @ResponseBody
  def addNewCourseParameterForUser(@PathVariable courseid: Int, request: HttpServletRequest,
                            @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isSubscriberForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    try {
      val key = jsonNode.get("key").asText()
      val value = jsonNode.get("value").asText()
      courseParamService.setCourseParamsForUser(courseid, key, value, user.get)

    } catch {
      case _: NullPointerException => throw new BadRequestException("Please provide: key and value")
    }
  }

  /**
    * delete a course parameter of user
    * @param courseid unique course identification
    * @param key parameter key
    * @param request Request Header containing Headers
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters/users/{key}"), method = Array(RequestMethod.DELETE))
  @ResponseBody
  def addNewCourseParameterForUser(@PathVariable courseid: Int, @PathVariable key: String, request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isSubscriberForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }

    courseParamService.deleteCourseParamsForUser(courseid, key, user.get)
  }

  /**
    * get all course paramters of user
    * @param courseid unique course identification
    * @param request Request Header containing Headers
    * @return JSON Map
    */
  @RequestMapping(value = Array("{courseid}/parameters/users"), method = Array(RequestMethod.GET))
  @ResponseBody
  def getAllCourseParameterForUser(@PathVariable courseid: Int, request: HttpServletRequest): List[Map[String, Any]] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || !courseService.isSubscriberForCourse(courseid, user.get)) {
      throw new UnauthorizedException
    }
    courseParamService.getAllCourseParamsForUser(courseid, user.get)
  }

  /**
    *
    * @param courseid unique course identification
    * @param taskid unique identification for a task
    * @param jsonNode contains JSON request
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("{courseid}/run/tasks/{taskid}"), method = Array(RequestMethod.POST))
  @ResponseBody
  def runAllTaskOfCourse(@PathVariable courseid: Int, @PathVariable taskid: Int, @RequestBody jsonNode: JsonNode,
                         request: HttpServletRequest): Map[String, Any] = {
    val requestingUser = userService.verifyUserByHeaderToken(request)

    if (requestingUser.isEmpty || !courseService.isPermittedForCourse(courseid, requestingUser.get)) {
      throw new UnauthorizedException
    }

    val taskDetailsOpt = taskService.getTaskDetails(taskid)

    if(taskDetailsOpt.isEmpty){
      throw new ResourceNotFoundException
    }
    val taskDetails = taskDetailsOpt.get

    var runComplete: Boolean = false

    if (jsonNode.get("complete") != null) {
      runComplete = jsonNode.get("complete").asBoolean()
    }

    for(user <- this.courseService.getSubscribedUserByCourse(courseid, List(RoleDBLabels.USER_ROLE_ID))) {
      val submissionID = taskService.submitTaskWithData(taskid, user, "")

      if (this.taskService.getMultiTestModeOfTask(taskid) == "SEQ") {
        taskService.sendSubmissionToTestsystem(submissionID, taskid, this.taskService.getTestsystemTopicsByTaskId(taskid).head,
          requestingUser.get, "external", null)
      } else {
        this.taskService.getTestsystemTopicsByTaskId(taskid).foreach(tasksystem_id => {
          taskService.sendSubmissionToTestsystem(submissionID, taskid, tasksystem_id,
            requestingUser.get, "external", null)
        })
      }
    }
    // TODO can be delted if it works runExternalTaskSendKafka(taskDetails, user, tasksystem_id, submissionID)
    Map("success" -> true)
  }

  /*private def runExternalTaskSendKafka(taskidOpt: Map[String, Any], user: User, tasksystem_id: String, submissionID: Int): Unit = {
    var kafkaMap: Map[String, Any] = Map("taskid" -> taskidOpt(TaskDBLabels.taskid).toString, "userid" -> user.username)

    kafkaMap += ("submit_typ" -> "external", "submissionid" -> submissionID,
      "jwt_token" -> testsystemService.generateTokenFromTestsystem(tasksystem_id))
    kafkaMap += ("course_parameter" -> courseParameterService.getAllCourseParamsForUser(
      taskidOpt(TaskDBLabels.courseid).asInstanceOf[Int], user))
    val jsonResult = JsonParser.mapToJsonStr(kafkaMap)

    logger.warn(taskService.connectKafkaTopic(tasksystem_id, topicName))
    logger.warn(jsonResult)
    kafkaTemplate.send(taskService.connectKafkaTopic(tasksystem_id, topicName), jsonResult)
    kafkaTemplate.flush()
  }*/
}
