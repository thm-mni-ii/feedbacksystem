package de.thm.ii.fbs.controller.classroom

import java.security.Principal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.classroom.UserConferenceMap.{BBBInvitation, Invitation, JitsiInvitation}
import de.thm.ii.fbs.model.classroom.{Classroom, UserConferenceMap, UserSessionMap}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.user.SimpUserRegistry
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.stereotype.Controller

/**
  * WebSocket controller that allows users to appear as logged in user.
  * @author Andrej Sajenko
  */
@Controller
class ClassroomController {
  @Autowired
  private val sur: SimpUserRegistry = null
  @Autowired
  private val smt: SimpMessagingTemplate = null
  @Autowired
  implicit private val userService: UserService = null
  private val logger: Logger = LoggerFactory.getLogger(classOf[ClassroomController])
  @Autowired
  implicit private val courseRegistrationService: CourseRegistrationService = null
  private val logger: Logger = LoggerFactory.getLogger(classOf[ClassroomController])
  private val courseIdLiteral = "courseId";

  private def userToJson(p: Participant): JSONObject = new JSONObject()
    .put("username", p.user.username)
    .put("prename", p.user.prename)
    .put("surname", p.user.surname)
    .put("role", p.role)

  /**
    * Removes users that loose connections
    */
  UserSessionMap.onDelete((id: String, principal: Principal) => {
    val participant = Classroom.getAllB.find(p => p.user.equals(principal))
    val courseId = Classroom.getAll.find(p => p._2.user.equals(principal))
    UserConferenceMap.delete(principal)

     (participant, courseId) match {
       case (Some(value), id) =>
        smt.convertAndSend("/topic/classroom/" + id + "/left", userToJson(value).toString)
      }
  })

  /**
    * Handle user enters classroom messages
    * @param m Message
    * @param headerAccessor Header information
    * @return Invite URL to conference
    */
  @MessageMapping(value = Array("/classroom/join"))
  def userJoined(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val courseId = m.get(courseIdLiteral).asInt();
    val principal = headerAccessor.getUser
    val user = this.userService.find(principal.getName)
    val participant = this.courseRegistrationService
      .getParticipants(courseId)
      .find(participant => participant.user.equals(user))

    participant match {
      case Some(participant) => Classroom.join(courseId, participant)
        smt.convertAndSend("/topic/classroom/" + courseId + "/joined", user.toString)
      case _ => logger.warn("User not registered in course")
    }



  }

  /**
    * Retrives all users messages
    * @param m Message
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/users"))
  def allUser(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val courseId = m.get(courseIdLiteral).asInt()
    val principal = headerAccessor.getUser
    val localUserOpt = this.userService.loadCourseUserFromDB(principal.getName, courseId);
    val globalUserOpt = this.userService.find(principal.getName)
    val user = localUserOpt.getOrElse(globalUserOpt.get)
    if (user.isAtLeastInRole(Role.TUTOR) || globalUserOpt.get.isAtLeastInRole(Role.MODERATOR)){
      val response = Classroom.getParticipants(courseId)
        .map(userToJson)
        .foldLeft(new JSONArray())((a, u) => a.put(u))
        .toString()
      smt.convertAndSendToUser(user.getName(), "/classroom/users", response)
    } else {
      val response = Classroom.getParticipants(courseId)
        .filter(u => u.isAtLeastInRole(Role.TUTOR) || UserConferenceMap.exists(u))
        .map(userToJson)
        .foldLeft(new JSONArray())((a, u) => a.put(u))
        .toString()
      smt.convertAndSendToUser(user.getName(), "/classroom/users", response)
    }
  }

  /**
    * Handles invite to conference messages.
    * @param invite Composed invite message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/invite"))
  def handleInviteMsg(@Payload invite: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val principal = headerAccessor.getUser
    val userOpt = this.userService.loadCourseUserFromDB(principal.getName, invite.get("courseid").asInt());
    val globalUserOpt = this.userService.find(principal.getName)

    if (!userOpt.get.isAtLeastInRole(Role.TUTOR) && !globalUserOpt.get.isAtLeastInRole(Role.MODERATOR)) {
      logger.warn(s"User: ${userOpt.get.username} tried to access the stream at 'handleInviteMsg' without authorization")
    } else {
      val users = invite.get("users").asInstanceOf[ArrayNode]

      val userAsJson = userToJson(userOpt.get)
      userAsJson.remove("username")
      userAsJson.remove("role")

      val msg = new JSONObject(invite.toPrettyString)
        .put("user", userAsJson)

      users.elements().forEachRemaining(e => {
        val username = e.get("username").asText()
        if (sur.getUser(username) != null) {
          smt.convertAndSendToUser(username, "/classroom/invite", msg.toString())
        }
      })
    }
  }

  private def invitationToJson(invitation: Invitation): JSONObject = {
    invitation match {
      case BBBInvitation(creator, courseId, visibility, attendees, service, meetingId, meetingPasswort, moderatorPassword) =>
        new JSONObject().put("creator", userToJson(creator))
          .put("meetingId", meetingId)
          .put(courseIdLiteral, courseId)
          .put("service", service)
          .put("meetingPassword", meetingPasswort)
          .put("moderatorPassword", moderatorPassword)
          .put("visibility", visibility)
          .put("attendees", attendees.foldLeft(new JSONArray())((a, u) => a.put(u)))
      case JitsiInvitation(creator, courseId, visibility, attendees, service, href) => {
        new JSONObject().put("creator", userToJson(creator))
          .put(courseIdLiteral, courseId)
          .put("service", service)
          .put("href", href)
          .put("visibility", visibility)
          .put("attendees", attendees.foldLeft(new JSONArray())((a, u) => a.put(u)))
      }
    }
  }
}
