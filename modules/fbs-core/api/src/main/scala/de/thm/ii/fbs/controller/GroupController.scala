package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{Group, CourseRole, GlobalRole}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for a group resource.
  */

@RestController
@CrossOrigin
@RequestMapping (path = Array("/api/v1/courses/{cid}/groups"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class GroupController{
  @Autowired
  private val groupService: GroupService = null
  @Autowired
  private  val authService: AuthService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null

  /**
    * Get a group list
    *
    * @param cid Course Id
    * @param ignoreHidden optional filter to filter only for visible groups
    * @param req http request
    * @param res http response
    * @return group list
    */
  @GetMapping(value = Array(""))
  @ResponseBody
  def getAll(@PathVariable ("cid") cid: Integer, @RequestParam(value = "visible", required = false)
  ignoreHidden: Boolean, req: HttpServletRequest, res: HttpServletResponse): List[Group] = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)
    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) => groupService.getAll(cid, ignoreHidden = false)
      case _ => groupService.getAll(cid)
    }
  }

  /**
    * Create a new group
    *
    * @param cid Course Id
    * @param req  http request
    * @param res  http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(@PathVariable ("cid") cid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Group = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)
    if (!(user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || someCourseRole.contains(CourseRole.DOCENT)))  {
      throw new ForbiddenException()
    }
    val name = Option(body.get("name")).map(_.asText())
    val membership = Option(body.get("membership")).map(_.asInt())
    val visible = Option(body.get("visible")).map(_.asBoolean())
    (name, membership, visible) match {
      case (Some(name), Some (membership), Some(visible))
      => groupService.create(Group(0, cid, name, membership, visible))
      case _ => throw new BadRequestException("Malformed Request Body")
    }
  }

  /**
    * Get a single group by id
    *
    * @param cid Course Id
    * @param gid Group id
    * @param req http request
    * @param res http response
    * @return A single group
    */
  @GetMapping(value = Array("/{gid}"))
  @ResponseBody
  def getOne(@PathVariable ("cid") cid: Integer, @PathVariable("gid") gid: Integer, req: HttpServletRequest, res: HttpServletResponse): Group = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    groupService.get(cid, gid) match {
      case Some(group) => if (!(user.globalRole == GlobalRole.ADMIN || user.globalRole == GlobalRole.MODERATOR || someCourseRole.contains(CourseRole.DOCENT))) {
        throw new ForbiddenException()
      } else {
        group
      }
      case _ => throw new ResourceNotFoundException()
    }
  }

  /**
    * Update a single group by id
    *
    * @param cid Course id
    * @param gid Group id
    * @param req http request
    * @param res http response
    * @param body Request Body
    */
  @PutMapping(value = Array("/{gid}"))
  def update(@PathVariable ("cid") cid: Integer, @PathVariable("gid") gid: Integer, req: HttpServletRequest, res: HttpServletResponse,
             @RequestBody body: JsonNode): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
        (body.retrive("name").asText(),
          body.retrive("membership").asInt(),
          body.retrive("visible").asBool()
          ) match {
           case (Some(name), Some (membership), visible)
           => groupService.update(cid, gid, Group(gid, cid, name, membership, visible.getOrElse(true)))
          case _ => throw new BadRequestException("Malformed Request Body")
        }
      case _ => throw new ForbiddenException()
    }
  }

  /**
    * Delete course
    *
    * @param cid Course id
    * @param gid Group id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/{gid}"))
  def delete(@PathVariable ("cid") cid: Integer, @PathVariable("gid") gid: Integer, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val someCourseRole = courseRegistrationService.getParticipants(cid).find(_.user.id == user.id).map(_.role)

    (user.globalRole, someCourseRole) match {
      case (GlobalRole.ADMIN | GlobalRole.MODERATOR, _) | (_, Some(CourseRole.DOCENT)) =>
       groupService.delete(cid, gid)
      case _ => throw new ForbiddenException()
    }
  }
}
