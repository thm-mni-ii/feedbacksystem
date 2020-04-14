package de.thm.ii.fbs.controller

import java.security.Principal
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.thm.ii.fbs.model.{Classroom, Role, User, UserSessionMap}
import de.thm.ii.fbs.services.UserService
import org.json.{JSONArray, JSONObject}
import org.slf4j.{Logger, LoggerFactory}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.MessagingException
import org.springframework.messaging.simp.{SimpMessageHeaderAccessor, SimpMessagingTemplate}
import org.springframework.messaging.handler.annotation.{MessageMapping, Payload}
import org.springframework.messaging.simp.user.SimpUserRegistry
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

    courseUser.foreach((course, user) => {
      smt.convertAndSend("/topic/classroom/" + course + "/left", userToJson(user).toString)
    })
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
    * @return Invite URL to conference
    */
  @MessageMapping(value = Array("/classroom/users"))
  def allUser(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): String = {
    val courseId = m.get("course").asInt()
    val principal = headerAccessor.getUser
    val userOpt = this.userService.loadUserFromDB(principal.getName)
    if (!userOpt.get.isAtLeastInRole(Role.TUTOR)) {
      throw new MessagingException(s"User: ${userOpt.get.username} tried to access the stream at 'handleTicketMsg' without authorization")
    }

    Classroom.getParticipants(courseId)
      .map(userToJson)
      .foldLeft(new JSONArray())((a, u) => a.put(u))
      .toString()
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
      logger.warn(s"User: ${userOpt.get.username} tried to access the stream at 'handleTicketMsg' without authorization")
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
}
