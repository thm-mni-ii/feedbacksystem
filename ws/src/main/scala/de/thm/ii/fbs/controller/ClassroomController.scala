package de.thm.ii.fbs.controller

import java.security.Principal

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import de.thm.ii.fbs.ConferenceSystemLabels
import de.thm.ii.fbs.model.UserConferenceMap.{BBBInvitation, Invitation, JitsiInvitation}
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.services.UserService
import de.thm.ii.fbs.util.JsonWrapper._
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.MessagingException
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.user.SimpUserRegistry
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.stereotype.Controller

import scala.collection.mutable

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
  private val courseIdLiteral = "courseId";
  private def userToJson(user: User): JSONObject = new JSONObject()
    .put("username", user.username)
    .put("prename", user.prename)
    .put("surname", user.surname)
    .put("role", user.roleid)

  /**
    * Removes users that loose connections
    */
  UserSessionMap.onDelete((id: String, p: Principal) => {
    val courseUser = for {
      user <- this.userService.loadUserFromDB(p.getName)
      courseId <- Classroom.leave(user)
    } yield (courseId, user)

    courseUser.foreach {
      case (course, user) => {
        UserConferenceMap.departAll(user)
        smt.convertAndSend("/topic/classroom/" + course + "/left", userToJson(user).toString)
      }
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
    val globalUserOpt = this.userService.loadUserFromDB(principal.getName);
    val userOpt = this.userService.loadCourseUserFromDB(principal.getName, courseId)
    val user = userToJson(userOpt.getOrElse(globalUserOpt.get))
    Classroom.join(courseId, userOpt.getOrElse(globalUserOpt.get))
    smt.convertAndSend("/topic/classroom/" + courseId + "/joined", user.toString)
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
    val globalUserOpt = this.userService.loadUserFromDB(principal.getName)
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
    val globalUserOpt = this.userService.loadUserFromDB(principal.getName)

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

  // Tickets
  Tickets.onCreate((ticket) => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/create", ticketToJson(ticket))
  })
  Tickets.onUpdate((ticket) => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/update", ticketToJson(ticket))
  })
  Tickets.onRemove((ticket) => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/remove", ticketToJson(ticket))
  })

  /**
    * Returns all tickets for a course
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/tickets"))
  def getAllTickets(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val localUserOpt = this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get);
    val globalUserOpt = this.userService.loadUserFromDB(headerAccessor.getUser.getName)
    var userOpt = if (globalUserOpt.get.isAtLeastInRole(Role.TUTOR)) globalUserOpt else localUserOpt
    localUserOpt match {
      case Some(v) => userOpt = localUserOpt;
      case None => userOpt = globalUserOpt;
    }

    val courseIdAndUser = for {
      user <- userOpt
      courseId <- m.retrive(courseIdLiteral).asInt()
    } yield (courseId, user)

    courseIdAndUser match {
      case Some(v) => {
        val (courseId, user) = v
        if (!user.isAtLeastInRole(Role.TUTOR)) {
          val response = Tickets.get(courseId)
            .map(ticketToJson)
            .filter(t => t.getJSONObject("creator").get("username").toString == user.getName())
            .foldLeft(new JSONArray())((a, t) => a.put(t))
            .toString
          smt.convertAndSendToUser(user.getName(), "/classroom/tickets", response)
        } else {
          val response = Tickets.get(courseId)
            .map(ticketToJson)
            .foldLeft(new JSONArray())((a, t) => a.put(t))
            .toString
          smt.convertAndSendToUser(user.getName(), "/classroom/tickets", response)
        }
      }
      case None => throw new MessagingException("Invalid content " + m)
    }
  }

  /**
    * Handles the creation of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/ticket/create"))
  def createTicket(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val ticketOpt = for {
      user <- this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get)
      courseId <- m.retrive(courseIdLiteral).asInt()
      title <- m.retrive("title").asText()
      desc <- m.retrive("desc").asText()
      status <- m.retrive("status").asText()
      timestamp <- m.retrive("timestamp").asLong()
      priority <- m.retrive("priority").asInt()
    } yield Tickets.create(courseId, title, desc, status, user, user, timestamp, priority)

    if (ticketOpt.isEmpty) {
      throw new MessagingException("Invalid msg: " + m)
    }
  }

  /**
    * Handles the update of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/ticket/update"))
  def updateTicket(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val ticketAndUser = for {
      user <- this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get)
      id <- m.retrive("id").asText()
      courseId <- m.retrive(courseIdLiteral).asInt()
      title <- m.retrive("title").asText()
      desc <- m.retrive("desc").asText()
      creator <- m.retrive("creator").asObject()
      assignee <- m.retrive("assignee").asObject()
      creatorName <- creator.retrive("username").asText()
      assigneeName <- assignee.retrive("username").asText()
      creatorAsUser <- userService.loadUserFromDB(creatorName)
      assigneeAsUser <- userService.loadUserFromDB(assigneeName)
      status <- m.retrive("status").asText()
      timestamp <- m.retrive("timestamp").asLong()
      priority <- m.retrive("priority").asInt()
    } yield (Ticket(courseId, title, desc, status, creatorAsUser, assigneeAsUser, timestamp, priority, id), user)

    ticketAndUser match {
      case Some(v) => {
        val (ticket, user) = v
        if (!(ticket.creator.username == user.username || user.isAtLeastInRole(Role.TUTOR))) {
          throw new MessagingException("User is not allowed to edit this ticket")
        } else {
          Tickets.update(ticket)
        }
      }
      case None => throw new MessagingException("Invalid content: " + m)
    }
  }

  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/ticket/remove"))
  def removeTicket(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val ticketAndUser = for {
      user <- this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get)
      id <- m.retrive("id").asText()
      ticket <- Tickets.getTicket(id)
    } yield (ticket, user)

    ticketAndUser match {
      case Some(v) =>
        val (ticket, user) = v
        if (!(ticket.creator.username == user.username || user.isAtLeastInRole(Role.TUTOR))) {
          throw new MessagingException("User is not allowed to remove this ticket")
        } else {
          Tickets.remove(ticket)
        }
      case None => throw new MessagingException("Invalid message: " + m)
    }
  }

  private def ticketToJson(ticket: Ticket): JSONObject = new JSONObject()
    .put("id", ticket.id)
    .put("title", ticket.title)
    .put("desc", ticket.desc)
    .put("creator", userToJson(ticket.creator))
    .put("assignee", userToJson(ticket.assignee))
    .put("priority", ticket.priority)
    .put("status", ticket.status)
    .put(courseIdLiteral, ticket.courseId)
    .put("timestamp", ticket.timestamp)

  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/opened"))
  def openConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val invLit: String = "invitation";
    val courseId = m.retrive(courseIdLiteral).asInt().get
    val user = this.userService.loadCourseUserFromDB(headerAccessor.getUser.getName, m.retrive(courseIdLiteral).asInt().get)
    val mapper: ObjectMapper = new ObjectMapper();
    val attendees: scala.collection.mutable.Set[String] = m.retrive(invLit).retrive("attendees").asText() match {
     case Some(v) => mapper.readValue(v, classOf[mutable.Set[String]])
     case None => mutable.Set();
    }

    val invitation = m.retrive("invitation").retrive("service").asText() match {
      case Some(ConferenceSystemLabels.bigbluebutton) => BBBInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("meetingId").asText().get,
        m.retrive(invLit).retrive("moderatorPassword").asText().get)
      case Some(ConferenceSystemLabels.jitsi) => JitsiInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("href").asText().get)
    }
    UserConferenceMap.map(invitation, headerAccessor.getUser)
  }

  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/closed"))
  def closeConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    UserConferenceMap.delete(headerAccessor.getUser)
  }
  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/attend"))
  def attendConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val invLit: String = "invitation";
    var attendees: mutable.Set[String] = mutable.Set[String]();
    val attendeesNode: ArrayNode = m.get(invLit).get("attendees").asInstanceOf[ArrayNode]
    for (i <- 1 until attendeesNode.size()) {
      attendees += attendeesNode.get(i).asText()
    }
    val courseId = m.retrive(invLit).retrive(courseIdLiteral).asInt().get
    val user = this.userService.loadCourseUserFromDB(m.at("/invitation/creator/username").asText(), m.at("/invitation/courseId").asInt())
    val invitation = m.retrive("invitation").retrive("service").asText() match {
      case Some(ConferenceSystemLabels.bigbluebutton) => BBBInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("meetingId").asText().get,
        m.retrive(invLit).retrive("meetingPassword").asText().get)
      case Some(ConferenceSystemLabels.jitsi) => JitsiInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("href").asText().get)
    }
    UserConferenceMap.attend(invitation, headerAccessor.getUser)
  }
  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conference/depart"))
  def departConference(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val invLit: String = "invitation";
    var attendees: mutable.Set[String] = mutable.Set[String]();
    val attendeesNode: ArrayNode = m.get(invLit).get("attendees").asInstanceOf[ArrayNode]
    for (i <- 1 until attendeesNode.size()) {
      attendees += attendeesNode.get(i).asText()
    }
    val courseId = m.retrive(invLit).retrive(courseIdLiteral).asInt().get
    val user = this.userService.loadCourseUserFromDB(m.at("/invitation/creator/username").asText(), m.at("/invitation/courseId").asInt())
    val invitation = m.retrive("invitation").retrive("service").asText() match {
      case Some(ConferenceSystemLabels.bigbluebutton) => BBBInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("meetingId").asText().get,
        m.retrive(invLit).retrive("meetingPassword").asText().get)
      case Some(ConferenceSystemLabels.jitsi) => JitsiInvitation(user.get,
        courseId,
        m.retrive(invLit).retrive("visibility").asText().get,
        attendees,
        m.retrive(invLit).retrive("service").asText().get,
        m.retrive(invLit).retrive("href").asText().get)
    }
    UserConferenceMap.depart(invitation, headerAccessor.getUser)
  }
  /**
    * Handles the removal of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/conferences"))
  def getConferences(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val courseId = m.get(courseIdLiteral).asInt()
    val principal = headerAccessor.getUser
    val localUserOpt = this.userService.loadCourseUserFromDB(principal.getName, courseId);
    val globalUserOpt = this.userService.loadUserFromDB(principal.getName)
    val user = localUserOpt.getOrElse(globalUserOpt.get)
    smt.convertAndSendToUser(user.username, "/classroom/conferences",
      UserConferenceMap.getInvitations(courseId).map(invitationToJson)
        .foldLeft(new JSONArray())((a, u) => a.put(u))
        .toString)
  }

  UserConferenceMap.onMap((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/opened", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onAttend((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/attend", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onDepart((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/depart", invitationToJson(invitation).toString)
  })

  UserConferenceMap.onDelete((invitation: Invitation, p: Principal) => {
    smt.convertAndSend("/topic/classroom/" + invitation.courseId + "/conference/closed", invitationToJson(invitation).toString)
  })

  private def invitationToJson(invitation: Invitation): JSONObject = {
    invitation match {
      case BBBInvitation(creator, courseId, visibility, attendees, service, meetingId, meetingPasswort) =>
        new JSONObject().put("creator", userToJson(creator))
          .put("meetingId", meetingId)
          .put(courseIdLiteral, courseId)
          .put("service", service)
          .put("meetingPassword", meetingPasswort)
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
