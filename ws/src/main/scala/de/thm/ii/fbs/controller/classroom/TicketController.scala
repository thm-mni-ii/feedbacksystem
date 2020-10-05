package de.thm.ii.fbs.controller.classroom

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.{CourseRole, GlobalRole, User, classroom}
import de.thm.ii.fbs.model.classroom.{Ticket, Tickets}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import de.thm.ii.fbs.services.security.CourseAuthService
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.json.{JSONArray, JSONObject}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.MessagingException
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.stereotype.Controller

/**
  * WebSocket Controller which allows users to manage Tickets
  */
@Controller
class TicketController {
  @Autowired
  private val smt: SimpMessagingTemplate = null
  @Autowired
  implicit private val userService: UserService = null
  @Autowired
  private val courseAuthService: CourseAuthService = null

  private val courseIdLiteral = "courseId"

  // Tickets
  Tickets.onCreate(ticket => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/create", ticketToJson(ticket))
  })
  Tickets.onUpdate(ticket => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/update", ticketToJson(ticket))
  })
  Tickets.onRemove(ticket => {
    smt.convertAndSend("/topic/classroom/" + ticket.courseId + "/ticket/remove", ticketToJson(ticket))
  })

  /**
    * Returns all tickets for a course
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/tickets"))
  def listAllTickets(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val courseIdOption = m.retrive(courseIdLiteral).asInt()
    val userOption = courseAuthService.getGlobalUser(headerAccessor)

    if (courseIdOption.isEmpty) {
      throw new MessagingException("Invalid msg: " + m)
    }

    val courseId = courseIdOption.get
    val user = userOption.get

    val response = if (courseAuthService.isPrivilegedInCourse(courseId, user)) {
      this.getTicketsForCourse(courseId)
    } else {
      this.getTicketsByUser(courseId, user)
    }
    smt.convertAndSendToUser(user.getName(), "/classroom/tickets", response)
  }

  private def getTicketsForCourse(courseID: Int, filterFunction: JSONObject => Boolean = _ => true) =
    Tickets.get(courseID)
      .sortWith((a, b) => a.timestamp < b.timestamp)
      .zipWithIndex.map { case (t: Ticket, i: Int) => t.queuePosition = i + 1; t }
      .map { t: Ticket => ticketToJson(t) }
      .filter(filterFunction)
      .foldLeft(new JSONArray())((a, t) => a.put(t))
      .toString

  private def getTicketsByUser(courseID: Int, user: User) = getTicketsForCourse(courseID,
    t => t.getJSONObject("creator").get("username").toString == user.getName())

  /**
    * Handles the creation of tickets
    * @param m Composed ticket message.
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/ticket/create"))
  def createTicket(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val title = m.retrive("title").toString.trim
    val desc = m.retrive("desc").toString.trim
    val priority = m.retrive("priority").asInt().asInstanceOf[Int]
    if (title.isBlank) {
      throw new Exception("Title can not be empty")
    }
    if (desc.isBlank) {
      throw new Exception("Description can not be empty")
    }
    if (priority > 0 && priority <= 10) {
      throw  new Exception("Priority must be between 0 and 11")
    }
    val ticketOpt = for {
      user <- courseAuthService.getCourseUser(headerAccessor, m)
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
      user <- courseAuthService.getCourseUser(headerAccessor, m)
      id <- m.retrive("id").asText()
      courseId <- m.retrive(courseIdLiteral).asInt()
      title <- m.retrive("title").asText()
      desc <- m.retrive("desc").asText()
      creator <- m.retrive("creator").asObject()
      assignee <- m.retrive("assignee").asObject()
      creatorName <- creator.retrive("username").asText()
      assigneeName <- assignee.retrive("username").asText()
      creatorAsUser <- userService.find(creatorName)
      assigneeAsUser <- userService.find(assigneeName)
      status <- m.retrive("status").asText()
      timestamp <- m.retrive("timestamp").asLong()
      priority <- m.retrive("priority").asInt()
    } yield (classroom.Ticket(courseId, title, desc, status, creatorAsUser, assigneeAsUser, timestamp, priority, id), user)

    ticketAndUser match {
      case Some(v) =>
        val (ticket, user) = v
        if (ticket.creator.username == user.username || courseAuthService.isPrivilegedInCourse(ticket.courseId, user)) {
          Tickets.update(ticket)
        } else {
          throw new MessagingException("User is not allowed to edit this ticket")
        }
      case None => throw new MessagingException("Invalid msg: " + m)
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
      user <- courseAuthService.getCourseUser(headerAccessor, m)
      id <- m.retrive("id").asText()
      ticket <- Tickets.getTicket(id)
    } yield (ticket, user)

    ticketAndUser match {
      case Some(v) =>
        val (ticket, user) = v
        if (ticket.creator.username == user.username || courseAuthService.isPrivilegedInCourse(ticket.courseId, user)) {
          Tickets.remove(ticket)
        } else {
          throw new MessagingException("User is not allowed to remove this ticket")
        }
      case None => throw new MessagingException("Invalid msg: " + m)
    }
  }

  private def userToJson(user: User): JSONObject = new JSONObject()
    .put("username", user.username)
    .put("prename", user.prename)
    .put("surname", user.surname)
    .put("role", user.globalRole.id)

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
    .put("queuePosition", ticket.queuePosition)
}
