package de.thm.ii.fbs.controller.classroom

import java.security.Principal

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.CourseRole
import de.thm.ii.fbs.model.classroom.{Classroom, UserConferenceMap}
import de.thm.ii.fbs.services.conferences.{BBBService, Conference, ConferenceServiceFactoryService, JitsiService}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.services.security.{AuthService, CourseAuthService}
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.json.{JSONArray, JSONObject}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.stereotype.Controller

/**
  * Handles conference conference massages
  * @author Andrej Sajenko
  */
@Controller
class ConferenceSTOMPController {
    @Autowired
    private val smt: SimpMessagingTemplate = null
    @Autowired
    private val userService: UserService = null
    @Autowired
    private val courseAuthService: CourseAuthService = null
    @Autowired
    private val conferenceServiceFactoryService: ConferenceServiceFactoryService = null
    @Autowired
    implicit private val authService: AuthService = null
    @Autowired
    implicit private val courseRegistrationService: CourseRegistrationService = null

  /**
    * Receives an conference from a Course Participant and notifies every invitee about it
    * @param p Composed conference message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/invite"))
  def handleInviteMsg(@Payload p: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val inviter = headerAccessor.getUser
    val conference = UserConferenceMap.get(inviter).getOrElse(throw new Exception("Unkonwn Conference"))
    val invitees = p.get("users").elements()
    if (courseAuthService.isPrivilegedInCourse(conference.courseId.toInt, userService.find(inviter.getName).get)) {
      invitees.forEachRemaining(invitee => {
        if (Classroom.getParticipants(conference.courseId.toInt).exists(p => p.user.username == invitee.get("username").asText())){
          conference.getURL(userService.find(invitee.get("username").asText()).get)
          smt.convertAndSendToUser(invitee.get("username").asText(), "/classroom/invite",
            new JSONObject()
              .put("user", userService.find(inviter.getName).get.toJson)
              .put("cid", conference.id)
              .toString)
        }
      })
    }
  }
  /**
    * Adds User to Conference Mapping
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/open"))
  def openConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val conferenceService = m.retrive("service").asText() match {
      case Some(BBBService.name) => conferenceServiceFactoryService(BBBService.name)
      case Some(JitsiService.name) => conferenceServiceFactoryService(JitsiService.name)
      case Some(name) => throw new IllegalArgumentException(s"Unknown service: ${name}")
      case None => throw new IllegalArgumentException("Service name not provided")
    }
    val courseId: String = m.retrive("courseId").asText().getOrElse(throw new IllegalArgumentException("Missing courseId"))
    val conference: Conference = conferenceService.createConference(courseId)
    UserConferenceMap.map(conference, headerAccessor.getUser)
    smt.convertAndSendToUser(headerAccessor.getUser.getName, "/classroom/opened",
      new JSONObject().put("href", conference.getURL(userService.find(headerAccessor.getUser.getName).get).toString).toString)
  }

  /**
    * Join the Conference of someone else
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/join"))
  def joinConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val isAuthorized: Boolean = Classroom.getParticipants(m.get("courseId").asInt)
      .find(p => p.user.username == headerAccessor.getUser.getName).get.role < CourseRole.STUDENT
    val conference: Conference = UserConferenceMap.get(userService.find(m.get("user").get("username").asText).get)
      .filter(c => c.visibility == "true" || m.get("mid").asText == c.id || isAuthorized) match {
      case Some(conference) => conference
      case None => throw new IllegalArgumentException("Unknown Conference Host")
    }
    UserConferenceMap.map(conference, headerAccessor.getUser)
    smt.convertAndSendToUser(headerAccessor.getUser.getName, "/classroom/conference/joined",
     new JSONObject().put("href", conference.getURL(userService.find(headerAccessor.getUser.getName).get).toString).toString)
  }

    /**
      * Removes user and related conference from map
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/close"))
    def closeConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      UserConferenceMap.delete(headerAccessor.getUser)
    }

  /**
    * Removes user and related conference from map
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/show"))
  def showConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val conference: Conference = UserConferenceMap.get(headerAccessor.getUser).getOrElse(throw new Exception("No Conference Found"))
    conference.visibility = "true"
    smt.convertAndSend("/topic/classroom/" + conference.courseId + "/conference/opened", {})
  }

  /**
    * Removes user and related conference from map
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/hide"))
  def hideConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val conference: Conference = UserConferenceMap.get(headerAccessor.getUser).getOrElse(throw new Exception("No Conference Found"))
    conference.visibility = "false"
    smt.convertAndSend("/topic/classroom/" + conference.courseId + "/conference/closed", {})
  }

    /**
      * Get Users that are sharing their conference
      * @param m Composed ticket message.
      * @param headerAccessor Header information
      */
    @MessageMapping(value = Array("/classroom/conference/users"))
    def getUsers(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
      val courseId = m.get("courseId").asInt()
      val user = this.userService.find(headerAccessor.getUser.getName).getOrElse(throw new NoSuchElementException)
      val accessorParticipant = Classroom.getParticipants(courseId).find(p => p.user.username == user.username).get
      val isAuthorized = accessorParticipant.role <= CourseRole.TUTOR

      smt.convertAndSendToUser(user.username, "/classroom/conference/users",
        UserConferenceMap.getAll
          .filter(c => (c._1.visibility == "true" || (isAuthorized && accessorParticipant.user.username != c._2.getName))
            && c._1.courseId == courseId.toString)
          .map(c => userService.find(c._2.getName).get.toJson).foldLeft(new JSONArray())((a, u) => a.put(u))
          .toString)
       /* UserConferenceMap.getConferences(courseId)
          .filter(conference => conference.isVisible)
          .map(conference => UserConferenceMap.get(conference))
          .map(principals => Classroom.getParticipants(courseId).find(p => p.user.username == principal.).get.toJson)
           */

    }

  UserConferenceMap.onMap((conference: Conference, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + conference.courseId + "/conference/opened", {})
  })

  UserConferenceMap.onDelete((conference: Conference, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + conference.courseId + "/conference/closed", {})
  })
}
