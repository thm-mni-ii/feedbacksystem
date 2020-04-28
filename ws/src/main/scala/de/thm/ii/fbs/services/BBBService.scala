package de.thm.ii.fbs.services

import de.thm.ii.fbs.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.stereotype.Service

import scala.language.postfixOps
import scala.sys.process._

/**
  * Handles BBB requests.
  * @param templateBuilder Request template builder.
  * @author Simon Schniedenharn
  */
@Service
class BBBService(templateBuilder: RestTemplateBuilder) {
  @Autowired
  private implicit val userService: UserService = null

  /**
    * Register a new conference.
    * @param id Conference id to register.
    * @param meetingName Conference id to register.
    * @param password password to register.
    * @param moderatorPassword moderator password to register.
    * @return boolean showing if creation of room was successful
    */
  def registerBBBConference(id: String, meetingName: String, password: String, moderatorPassword: String): Int = {
    // todo: fix path for live system
    Process(s"create_room.py ${meetingName} ${id} ${password} ${moderatorPassword}", None, "BBB_SECRET" -> sys.env("BBB_SECRET"))!
  }
  /**
    * Get join Link for conference users conference.
    * @param id Conference id to register.
    * @param user user name to register.
    * @param password password to register.
    * @return The uri of the registered conference
    */
  def joinBBBConference(id: String, user: User, password: String): String = {
    Process("join_room.py '${user.prename} ${user.prename}' ${id} ${password}", None, "BBB_SECRET" -> sys.env("BBB_SECRET"))!!
  }
}
