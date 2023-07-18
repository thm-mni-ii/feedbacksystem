package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ResourceNotFoundException}
import de.thm.ii.fbs.model.Semester
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper._
import de.thm.ii.fbs.utils.v2.security.authorization.{IsAdmin, IsModerator}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

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
  @IsModerator
  def getAll(req: HttpServletRequest, res: HttpServletResponse): List[Semester] = semesterService.getAll

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
  @IsAdmin
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Semester =
    body.retrive("name").asText() match {
      case Some(name) => semesterService.create(Semester(0, name))
      case _ => throw new BadRequestException("Malformed Request Body")
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
  @IsModerator
  def getOne(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse): Any =
    semesterService.find(sid) match {
      case Some(semester) => semester
      case _ => throw new ResourceNotFoundException()
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
  @IsAdmin
  def update(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit =
    (body.retrive("id").asInt(), body.retrive("name").asText())
    match {
      case (Some(id), Some(name)) => semesterService.update(sid, Semester(id, name))
      case _ => throw new BadRequestException("Malformed Request Body")
    }

  /**
    * Delete Semester
    *
    * @param sid Semester id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{sid}"))
  @IsAdmin
  def delete(@PathVariable("sid") sid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = semesterService.delete(sid)
}
