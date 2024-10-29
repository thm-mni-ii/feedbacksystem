package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.{ForbiddenException, MembershipExceededException, ResourceNotFoundException}
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Group, Participant}
import de.thm.ii.fbs.services.persistence._
import de.thm.ii.fbs.services.security.AuthService

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for group registration and group members.
  */

@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class GroupRegistrationController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val courseRegistrationService: CourseRegistrationService = null
  @Autowired
  private val groupService: GroupService = null
  @Autowired
  private val groupRegistrationService: GroupRegistrationService = null

  /**
    * Add a user to a group within a course
    *
    * @param cid Course id
    * @param gid Group id
    * @param uid User id
    * @param req http request
    * @param res http response
    */
  @PutMapping(value = Array("/courses/{cid}/groups/{gid}/users/{uid}"), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def addUserToGroup(@PathVariable("cid") cid: Int, @PathVariable("gid") gid: Int, @PathVariable("uid") uid: Int,
                   req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val hasGlobalPrivileges = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
    val hasCoursePrivileges = courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)  == CourseRole.DOCENT
    if (hasGlobalPrivileges || hasCoursePrivileges ||  user.id == uid) {
      //Check if the group is full
      val currentMembership = groupRegistrationService.getGroupMembership(cid, gid)
      val group = groupService.get(cid, gid)
      group match {
        case Some(group) => val maxMembership: Int = group.membership
        if (currentMembership < maxMembership) {
          groupRegistrationService.addUserToGroup(uid, cid, gid)
        } else {
          throw new MembershipExceededException()
        }
        case _ => throw new ResourceNotFoundException()
      }
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Remove a user from a group
    *
    * @param uid User id
    * @param cid Course id
    * @param gid Group id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/courses/{cid}/groups/{gid}/users/{uid}"))
  def removeUserFromGroup(@PathVariable("uid") uid: Int, @PathVariable("cid") cid: Int, @PathVariable("gid") gid: Int,
                          req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val hasGlobalPrivileges = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
    val hasCoursePrivileges = courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)  == CourseRole.DOCENT
    if (hasGlobalPrivileges || hasCoursePrivileges ||  user.id == uid) {
      groupRegistrationService.removeUserFromGroup(uid, cid, gid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Remove all users from a group
    *
    * @param cid Course id
    * @param gid Group id
    * @param req http request
    * @param res http response
    */
  @DeleteMapping(value = Array("/courses/{cid}/groups/{gid}/users"))
  def removeUserFromGroup(@PathVariable("cid") cid: Int, @PathVariable("gid") gid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = {
    val user = authService.authorize(req, res)
    val hasGlobalPrivileges = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
    val hasCoursePrivileges = courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)  == CourseRole.DOCENT
    if (hasGlobalPrivileges || hasCoursePrivileges) {
      groupRegistrationService.removeAllUsersFromGroup(cid, gid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Retrieve all groups of a specific user
    *
    * @param uid User id
    * @param req http request
    * @param res http response
    * @return List of Groups
    */
  @GetMapping(value = Array("/users/{uid}/groups"))
  @ResponseBody
  def getUserGroups(@PathVariable("uid") uid: Integer, req: HttpServletRequest, res: HttpServletResponse): List[Group] = {
    val user = authService.authorize(req, res)
    val hasGlobalPrivileges = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
    if (hasGlobalPrivileges || user.id == uid) {
      groupRegistrationService.getUserGroups(uid, ignoreHidden = false)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
    * Get all course participants which are part of a group
    * @param cid Course id
    * @param gid Group id
    * @param req http request
    * @param res http response
    * @return List of course participants
    */
  @GetMapping(value = Array("/courses/{cid}/groups/{gid}/participants"))
  @ResponseBody
  def getMembers(@PathVariable("cid") cid: Integer, @PathVariable("gid") gid: Int, req: HttpServletRequest, res: HttpServletResponse): List[Participant] = {
    val user = authService.authorize(req, res)
    val hasGlobalPrivileges = user.hasRole(GlobalRole.ADMIN, GlobalRole.MODERATOR)
    val hasCoursePrivileges = courseRegistrationService.getCoursePrivileges(user.id).getOrElse(cid, CourseRole.STUDENT)  == CourseRole.DOCENT
    if (hasGlobalPrivileges || hasCoursePrivileges) {
      groupRegistrationService.getMembers(cid, gid)
    } else {
      throw new ForbiddenException()
    }
  }

  /**
   * Get current number of members of a group
   *
   * @param cid Course id
   * @param gid Group id
   * @return Number of members
   */
  @GetMapping(Array("/courses/{cid}/groups/{gid}/membership"))
  def getGroupMembership(@PathVariable("cid") cid: Integer, @PathVariable("gid") gid: Int): ResponseEntity[Int] = {
    val membership = groupRegistrationService.getGroupMembership(cid, gid)
    ResponseEntity.ok(membership)
  }
}
