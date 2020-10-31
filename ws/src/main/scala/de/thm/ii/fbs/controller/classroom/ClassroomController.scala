package de.thm.ii.fbs.controller.classroom

import java.security.Principal

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model._
import de.thm.ii.fbs.model.classroom.{Classroom, UserConferenceMap, UserSessionMap}
import de.thm.ii.fbs.services.persistance.{CourseRegistrationService, UserService}
import org.json.JSONArray
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
  private val courseIdLiteral = "courseId";

  // Removes users that lose connections
  UserSessionMap.onDelete((id: String, principal: Principal) => {
    Classroom.getAll.find(p => p._2.user.equals(principal)) match {
      case Some((cid, user)) =>
        Classroom.deleteByB(user)
        UserConferenceMap.delete(principal)
        smt.convertAndSend("/topic/classroom/" + cid + "/left", user.toJson.toString)
      case None => // Nothing on purpose
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
    val cid = m.get(courseIdLiteral).asInt();
    val user = headerAccessor.getUser
    this.courseRegistrationService.getParticipants(cid).find(p => p.user.equals(user)) match {
      case Some(participant) => Classroom.join(cid, participant)
        smt.convertAndSend("/topic/classroom/" + cid + "/joined", participant)
      case _ => logger.warn("User not registered in course")
    }
  }

  /**
    * Handle user enters classroom messages
    * @param m Message
    * @param headerAccessor Header information
    * @return Invite URL to conference
    */
  @MessageMapping(value = Array("/classroom/leave"))
  def userLeft(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val cid = m.get(courseIdLiteral).asInt();
    val user = headerAccessor.getUser
    this.courseRegistrationService.getParticipants(cid).find(p => p.user.equals(user)) match {
      case Some(participant) => Classroom.leave(participant)
        smt.convertAndSend("/topic/classroom/" + cid + "/left", participant)
      case _ =>
    }
  }

  /**
    * Retrives all users messages
    * @param m Message
    * @param headerAccessor Header information
    */
  @MessageMapping(value = Array("/classroom/users"))
  def allUser(@Payload m: JsonNode, headerAccessor: SimpMessageHeaderAccessor): Unit = {
    val cid = m.get(courseIdLiteral).asInt()
    val principal = headerAccessor.getUser
    var participants = Classroom.getParticipants(cid);
    (this.userService.find(principal.getName), this.courseRegistrationService.getParticipants(cid).find(p => p.user.equals(principal))) match {
      case (Some(globalUser), Some(localUser)) =>
        if (globalUser.globalRole > GlobalRole.MODERATOR && localUser.role > CourseRole.TUTOR) {
          participants = participants
            .filter(u => u.role <= CourseRole.TUTOR
              || UserConferenceMap.getA(u.user).exists(c => c.visibility == "true")
              || u.user == principal)
        }
      case (Some(globalUser), None) =>
        if (globalUser.globalRole <= GlobalRole.MODERATOR) {
          participants = participants
            .filter(u => u.role <= CourseRole.TUTOR
              || u.user == principal)
        }
      case _ => throw new IllegalArgumentException()
    }
    val filteredParticipants = participants.map(p => p.toJson)
      .foldLeft(new JSONArray())((a, u) => a.put(u))
      .toString()
    smt.convertAndSendToUser(principal.getName(), "/classroom/users", filteredParticipants)
  }
}
