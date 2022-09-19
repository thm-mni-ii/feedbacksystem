package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{GlobalRole, Semester}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for a semester resource.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/semester"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class SemesterController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val semesterService: SemesterService = null

  /**
    * Get a semester list
    *
    * @param req http request
    * @param res http response
    * @return semester list
    */
  @GetMapping(value = Array(""))
  @ResponseBody
  def getAll(@RequestParam(value = "visible", required = false) req: HttpServletRequest, res: HttpServletResponse): List[Semester] = {
    val user = authService.authorize(req, res)
    val semester = semesterService.getAll
    user.globalRole match {
      case GlobalRole.ADMIN | GlobalRole.MODERATOR => semester
    }
  }

  /**
    * Create a new semester
    *
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Semester = {
    if (authService.authorize(req, res).globalRole == GlobalRole.USER) {
      throw new ForbiddenException()
    }
    (
      body.retrive("semesterId").asInt(),
      body.retrive("name").asText()
    )
    match {
      case (Some(semesterId), Some(name)) => semesterService.create(Semester(semesterId, name))
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Get a single semester
    *
    * @param sid semester id
    * @param req http request
    * @param res http response
    * @return A course
    */
  @GetMapping(value = Array("/{sid}"))
  @ResponseBody
  def getOne(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse): Any = {
    val user = authService.authorize(req, res)

    semesterService.find(sid) match {
      case Some(semester) => if (!(user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR)) {
        throw new ForbiddenException()
      } else {
        semester
      }
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Update semester
    *
    * @param sid  Semester id
    * @param req  http request
    * @param res  http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{sid}"))
  def update(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)

    user.globalRole match {
      case GlobalRole.ADMIN | GlobalRole.MODERATOR =>
        (body.retrive("semesterId").asInt(),
          body.retrive("name").asText())
        match {
          case (Some(semesterId), Some(name)) => semesterService.update(sid, Semester(semesterId, name))
          case _ => throw new BadRequestException("Malformed Request Body")
        }
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Delete Semester
    *
    * @param sid Semester id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{sid}"))
  def delete(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)

    user.globalRole match {
      case GlobalRole.ADMIN | GlobalRole.MODERATOR =>
        // Save submissions and configurations
        semesterService.delete(sid)
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Export Semester
    *
    * @param sid Semester id
    * @param req http request
    * @param res http response
    */
  @GetMapping(value = Array("/{sid}/export"))
  @ResponseBody
  def export(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = ??? // TODO: Impl
}
