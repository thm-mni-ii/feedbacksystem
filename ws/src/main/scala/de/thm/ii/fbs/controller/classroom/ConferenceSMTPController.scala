package de.thm.ii.fbs.controller.classroom

import java.security.Principal

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.classroom.UserConferenceMap
import de.thm.ii.fbs.model.classroom.{BBBInvitation, Invitation, JitsiInvitation}
import de.thm.ii.fbs.services.conferences.{BBBService, JitsiService}
import de.thm.ii.fbs.services.persistance.UserService
import de.thm.ii.fbs.util.JsonWrapper._
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.user.SimpUserRegistry
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.stereotype.Controller

import scala.collection.mutable

/**
  * Handles conference invitation massages
  * @author Andrej Sajenko
  */
@Controller
class ConferenceSMTPController {
    @Autowired
    private val sur: SimpUserRegistry = null
    @Autowired
    private val smt: SimpMessagingTemplate = null
    @Autowired
    private val bbbService: BBBService = null
    @Autowired
    private val jitsiService: JitsiService = null
    @Autowired
    implicit private val userService: UserService = null
    private val logger: Logger = LoggerFactory.getLogger(classOf[ConferenceSMTPController])
    private val courseIdLiteral = "courseId";
    private def userToJson(user: User): JSONObject = new JSONObject()
      .put("username", user.username)
      .put("prename", user.prename)
      .put("surname", user.surname)
      .put("role", user.globalRole.id)

    /**
      * Handles invite to conference messages.
      * @param invite Composed invite message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/invite"))
    def handleInviteMsg(@Payload invite: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = ???
//    {
//      val principal = headerAccessor.getUser
//      val userOpt = this.userService.loadCourseUserFromDB(principal.getName, invite.get("courseid").asInt());
//      val globalUserOpt = this.userService.find(principal.getName)
//
//      if (!userOpt.get.isAtLeastInRole(Role.TUTOR) && !globalUserOpt.get.isAtLeastInRole(Role.MODERATOR)) {
//        logger.warn(s"User: ${userOpt.get.username} tried to access the stream at 'handleInviteMsg' without authorization")
//      } else {
//        val users = invite.get("users").asInstanceOf[ArrayNode]
//
//        val userAsJson = userToJson(userOpt.get)
//        userAsJson.remove("username")
//        userAsJson.remove("role")
//
//        val msg = new JSONObject(invite.toPrettyString)
//          .put("user", userAsJson)
//
//        users.elements().forEachRemaining(e => {
//          val username = e.get("username").asText()
//          if (sur.getUser(username) != null) {
//            smt.convertAndSendToUser(username, "/classroom/invite", msg.toString())
//          }
//        })
//      }
//    }

    /**
      * Handles the removal of tickets
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/open"))
    def openConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = ???
//    {
//      val invLit: String = "invitation";
//      val courseId = m.retrive(courseIdLiteral).asInt().get
//      val user = this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get)
//      val mapper: ObjectMapper = new ObjectMapper();
//      val attendees: scala.collection.mutable.Set[String] = m.retrive(invLit).retrive("attendees").asText() match {
//        case Some(v) => mapper.readValue(v, classOf[mutable.Set[String]])
//        case None => mutable.Set();
//      }
//
//      val invitation = m.retrive("invitation").retrive("service").asText() match {
//        case Some(bbbService.name) => BBBInvitation(user.get,
//          courseId,
//          m.retrive(invLit).retrive("visibility").asText().get,
//          attendees,
//          m.retrive(invLit).retrive("service").asText().get,
//          m.retrive(invLit).retrive("meetingId").asText().get,
//          m.retrive(invLit).retrive("meetingPassword").asText().get,
//          m.retrive(invLit).retrive("moderatorPassword").asText().get)
//        case Some(jitsiService.name) => JitsiInvitation(user.get,
//          courseId,
//          m.retrive(invLit).retrive("visibility").asText().get,
//          attendees,
//          m.retrive(invLit).retrive("service").asText().get,
//          m.retrive(invLit).retrive("href").asText().get)
//      }
//      UserConferenceMap.map(invitation, headerAccessor.getUser)
//    }

    /**
      * Handles the removal of tickets
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/close"))
    def closeConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      UserConferenceMap.delete(headerAccessor.getUser)
    }

    /**
      * Handles the removal of tickets
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conferences"))
    def getConferences(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = ???
//    {
//      val courseId = m.get(courseIdLiteral).asInt()
//      val principal = headerAccessor.getUser
//      val localUserOpt = this.userService.loadCourseUserFromDB(principal.getName, courseId);
//      val globalUserOpt = this.userService.find(principal.getName)
//      val user = localUserOpt.getOrElse(globalUserOpt.get)
//      smt.convertAndSendToUser(user.username, "/classroom/conferences",
//        UserConferenceMap.getInvitations(courseId).map(invitationToJson)
//          .foldLeft(new JSONArray())((a, u) => a.put(u))
//          .toString)
//    }

  UserConferenceMap.onMap((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/opened", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onDelete((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/closed", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onDelete((invitation: Invitation, p: Principal) => {
      smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/closed", invitationToJson(invitation).toString)
  })

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
      case JitsiInvitation(creator, courseId, visibility, attendees, service, href) =>
        new JSONObject().put("creator", userToJson(creator))
          .put(courseIdLiteral, courseId)
          .put("service", service)
          .put("href", href)
          .put("visibility", visibility)
          .put("attendees", attendees.foldLeft(new JSONArray())((a, u) => a.put(u)))
    }
  }
}
