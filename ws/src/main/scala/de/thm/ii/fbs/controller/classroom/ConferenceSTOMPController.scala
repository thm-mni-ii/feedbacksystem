package de.thm.ii.fbs.controller.classroom
import java.security.Principal

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.classroom._
import de.thm.ii.fbs.services.conferences.{BBBService, JitsiService}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
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
class ConferenceSTOMPController {
    @Autowired
    private val smt: SimpMessagingTemplate = null
    @Autowired
    private val bbbService: BBBService = null
    @Autowired
    private val jitsiService: JitsiService = null
    @Autowired
    implicit private val authService: AuthService = null
    @Autowired
    implicit private val courseRegistrationService: CourseRegistrationService = null

    // private val logger: Logger = LoggerFactory.getLogger(classOf[ConferenceSTOMPController])
    private def userToJson(user: User): JSONObject = new JSONObject()
      .put("username", user.username)
      .put("prename", user.prename)
      .put("surname", user.surname)
      .put("globalRole", user.globalRole.id)

    private def invitationToJson(invitation: Invitation): JSONObject = {
      invitation match {
        case BBBInvitation(creator, courseId, visibility, service, meetingId, meetingPassword, moderatorPassword) =>
          new JSONObject().put("creator", userToJson(creator))
            .put("meetingId", meetingId)
            .put("courseId", courseId)
            .put("service", service)
            .put("meetingPassword", meetingPassword)
            .put("moderatorPassword", moderatorPassword)
            .put("visibility", visibility)
        case JitsiInvitation(creator, courseId, visibility, service, href) =>
          new JSONObject().put("creator", userToJson(creator))
            .put("courseId", courseId)
            .put("service", service)
            .put("href", href)
            .put("visibility", visibility)
      }
    }

  /**
    * Receives an invitation from a Course Participant and notifies every invitee about it
    * @param p Composed invitation message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/invite"))
  def handleInviteMsg(@Payload p: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val inviter = headerAccessor.getUser
    val invitation = p.get("invitation").asInstanceOf[Invitation]
    val invitees = p.get("users").asInstanceOf[Array[User]]
    Classroom.getParticipants(invitation.courseId).find(p => p.user.equals(inviter)) match {
      case Some(localUser) =>
        if (localUser.role > CourseRole.TUTOR) {
          invitees.foreach(invitee => {
            if (Classroom.getParticipants(invitation.courseId).exists(p => p.user.username == invitee.username)){
              smt.convertAndSendToUser(invitee.username, "/classroom/invite", invitationToJson(invitation))
            }
          })
        }
      case _ =>
        userService.find(inviter.getName) match {
          case Some(globalUser) =>
            if (globalUser.globalRole <= GlobalRole.MODERATOR) {
              invitees.foreach(invitee => {
                if (Classroom.getParticipants(invitation.courseId).exists(p => p.user.username == invitee.username)){
                  smt.convertAndSendToUser(invitee.username, "/classroom/invite", invitationToJson(invitation))
                }
              })
            }
        }
    }
  }
    /**
      * Adds User to Conference Mapping
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/open"))
    def openConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      val creator = userService.find(headerAccessor.getUser.getName)
      val invitationJsonWrapper = m.retrive("invitation")
      val invitation = invitationJsonWrapper.retrive("service").asText() match {
        case Some(bbbService.name) => BBBInvitation(creator.get,
          invitationJsonWrapper.retrive("courseId").asInt().get,
          invitationJsonWrapper.retrive("visible").asBool().get,
          invitationJsonWrapper.retrive("service").asText().get,
          invitationJsonWrapper.retrive("meetingId").asText().get,
          invitationJsonWrapper.retrive("meetingPassword").asText().get,
          invitationJsonWrapper.retrive("moderatorPassword").asText().get)
        case Some(jitsiService.name) => JitsiInvitation(creator.get,
          invitationJsonWrapper.retrive("courseId").asInt().get,
          invitationJsonWrapper.retrive("visible").asBool().get,
          invitationJsonWrapper.retrive("service").asText().get,
          invitationJsonWrapper.retrive("href").asText().get)
      }
      UserConferenceMap.map(invitation, headerAccessor.getUser)
   }

    /**
      * Removes user and related invitation from map
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/leave"))
    def closeConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      UserConferenceMap.delete(headerAccessor.getUser)
    }

    /**
      * Get information about conferences
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conferences"))
    def getConferences(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      val courseId = m.get("courseId").asInt()
      val user = this.userService.find(headerAccessor.getUser.getName)
      smt.convertAndSendToUser(user.get.username, "/classroom/conferences",
        UserConferenceMap.getInvitations(courseId)
          .filter(i => i.visible)
          .map(invitationToJson)
          .foldLeft(new JSONArray())((a, u) => a.put(u))
          .toString)
    }

  UserConferenceMap.onMap((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/opened", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onDelete((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/left", invitationToJson(invitation).toString)
  })
}
