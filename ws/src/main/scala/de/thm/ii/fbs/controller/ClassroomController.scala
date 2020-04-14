package de.thm.ii.fbs.controller

import java.security.Principal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model.{Classroom, Role, Ticket, Tickets, User, UserSessionMap}
import de.thm.ii.fbs.services.UserService
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.MessagingException
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.user.SimpUserRegistry
import org.springframework.stereotype.Controller
import de.thm.ii.fbs.util.JsonWrapper._

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

  private def userToJson(user: User): JSONObject = new JSONObject()
    .append("username", user.username)
    .append("prename", user.prename)
    .append("surname", user.surname)
    .append("role", user.roleid)

  /**
    * Removes users that loose connections
    */
  UserSessionMap.onDelete((id: String, p: Principal) => {
    val courseUser = for {
      user <- this.userService.loadUserFromDB(p.getName)
      courseId <- Classroom.leave(user)
    } yield (courseId, user)

    courseUser.foreach {
      case (course, user) => smt.convertAndSend("/topic/classroom/" + course + "/left", userToJson(user).toString)
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
    val courseId = m.get("courseId").asInt()
    val principal = headerAccessor.getUser
    val userOpt = this.userService.loadUserFromDB(principal.getName)

    val user = userToJson(userOpt.get)
    Classroom.join(courseId, userOpt.get)
    smt.convertAndSend("/topic/classroom/" + courseId + "/joined", user.toString)
  }

  /**
    * Retrives all users messages
    * @param m Message
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/users"))
  def allUser(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val courseId = m.get("courseId").asInt()
    val principal = headerAccessor.getUser
    val userOpt = this.userService.loadUserFromDB(principal.getName)
    if (!userOpt.get.isAtLeastInRole(Role.TUTOR)) {
      throw new MessagingException(s"User: ${userOpt.get.username} tried to access the stream at 'allUser' without authorization")
    }

    val response = Classroom.getParticipants(courseId)
      .map(userToJson)
      .foldLeft(new JSONArray())((a, u) => a.put(u))
      .toString()

    smt.convertAndSendToUser(userOpt.get.getName(), "/classroom/users", response)
  }

  /**
    * Handles invite to conference messages.
    * @param invite Composed invite message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/invite"))
  def handleInviteMsg(@Payload invite: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val principal = headerAccessor.getUser
    val userOpt = this.userService.loadUserFromDB(principal.getName)

    if (!userOpt.get.isAtLeastInRole(Role.TUTOR)) {
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
    val courseIdAndUser = for {
      user <- this.userService.loadUserFromDB(headerAccessor.getUser.getName)
      courseId <- m.retrive("courseId").asInt()
    } yield (courseId, user)

    courseIdAndUser match {
      case Some(v) => {
        val (courseId, user) = v
        if (!user.isAtLeastInRole(Role.TUTOR)) {
          throw new MessagingException("User is not allowed to push on this topic")
        } else {
          val response = Tickets.get(courseId)
            .map(ticketToJson)
            .foldLeft(new JSONArray())((a, t) => a.put(t)).toString
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
      user <- this.userService.loadUserFromDB(headerAccessor.getUser.getName)
      courseId <- m.retrive("courseId").asInt()
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
      user <- this.userService.loadUserFromDB(headerAccessor.getUser.getName)
      id <- m.retrive("id").asLong()
      courseId <- m.retrive("courseId").asInt()
      title <- m.retrive("title").asText()
      desc <- m.retrive("desc").asText()
      creator <- m.retrive("creator").asObject()
      assignee <- m.retrive("assignee").asObject()
      creatorName <- creator.retrive("username").asText()
      assigneeName <- assignee.retrive("username").asText()
      creatorAsUser <- userService.loadUserFromDB(creatorName)
      assigneAsUser <- userService.loadUserFromDB(assigneeName)
      status <- m.retrive("status").asText()
      timestamp <- m.retrive("timestamp").asLong()
      priority <- m.retrive("priority").asInt()
    } yield (Ticket(courseId, title, desc, status, creatorAsUser, assigneAsUser, timestamp, priority), user)

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
      user <- this.userService.loadUserFromDB(headerAccessor.getUser.getName)
      id <- m.retrive("id").asLong()
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
    .put("courseId", ticket.courseId)
    .put("timestamp", ticket.timestamp)

}
