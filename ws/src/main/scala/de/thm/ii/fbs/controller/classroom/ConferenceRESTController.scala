package de.thm.ii.fbs.controller.classroom

import java.net.URI
import java.util.UUID

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.services.conferences.{BBBService, ConferenceServiceFactoryService, JitsiService}
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._
import scala.collection.mutable

/**
  * Handles conference conference massages
  * @author Andrej Sajenko
  */
@RestController
@CrossOrigin
@RequestMapping()
class ConferenceRESTController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val conferenceServiceFactoryService: ConferenceServiceFactoryService = null
  @Autowired
  private val bbbService: BBBService = null

  /**
    * Creates a single unique conference link.
    * @param req The request object
    * @param res The response object
    * @param body The body of the request.
    * @return The conference link
    */
  @RequestMapping(value = Array("/api/v1/classroom/conference"), method = Array(RequestMethod.POST))
  @ResponseBody
  def createConference(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Map[String, String] = {
    val user = authService.authorize(req, res)

    val serviceName = body.get("service").asText()

    val conferenceService = conferenceServiceFactoryService(serviceName)
    val conference = conferenceService.createConference(UUID.randomUUID().toString)

    val conferenceMap = mutable.Map(conference.toMap.toSeq: _*)

    conferenceMap("href") = conference.getURL(user).toString

    conferenceMap.toMap
  }

  /**
    * Creates a single unique conference link for bbb.
    * @param req The request object
    * @param res The response object
    * @param body The body of the request.
    * @return The conference link
    */
  @RequestMapping(value = Array("/api/v1/classroom/conference/bigbluebutton/invite"), method = Array(RequestMethod.POST))
  @ResponseBody
  def getBBBConferenceLink(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Map[String, String] = {
    val user = authService.authorize(req, res)
    val inviteeUri: URI = this.bbbService.getBBBConferenceLink(user, body.get("meetingId").asText(), body.get("meetingPassword").asText())
    Map("href" -> inviteeUri.toString)
  }
}
