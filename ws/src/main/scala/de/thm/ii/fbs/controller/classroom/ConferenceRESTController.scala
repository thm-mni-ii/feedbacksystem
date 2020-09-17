package de.thm.ii.fbs.controller.classroom

import java.net.URI
import java.util.UUID

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.services.conferences.{BBBService, JitsiService}
import de.thm.ii.fbs.services.labels.ConferenceSystemLabels
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

/**
  * Handles conferece invitation massages
  * @author Andrej Sajenko
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/classroom/conference"))
class ConferenceRESTController {
  @Autowired
  private val authService: AuthService = null
  @Autowired
  private val bbbService: BBBService = null
  @Autowired
  private val jitsiService: JitsiService = null

  /**
    * Creates a single unique conference link.
    * @param req The request object
    * @param res The response object
    * @param body The body of the request.
    * @return The conference link
    */
  @RequestMapping(value = Array("/"), method = Array(RequestMethod.POST))
  @ResponseBody
  def createConference(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Map[String, String] = {
    val user = authService.authorize(req, res)

    body.get("service").asText() match {
      case ConferenceSystemLabels.JITSI =>
        val id = UUID.randomUUID()
        val uri: URI = this.jitsiService.registerJitsiConference(id.toString)
        Map("href" -> uri.toString, "service" -> ConferenceSystemLabels.JITSI)
      case ConferenceSystemLabels.BIGBLUEBUTTON =>
        val meetingId = UUID.randomUUID().toString
        val meetingPassword = UUID.randomUUID().toString
        val moderatorPassword = UUID.randomUUID().toString
        this.bbbService.registerBBBConference(meetingId, meetingId, meetingPassword, moderatorPassword)
        val inviteeUri: String = this.bbbService.getBBBConferenceLink(user, meetingId, moderatorPassword)
        Map(
          "href" -> inviteeUri,
          "meetingId" -> meetingId,
          "meetingPassword" -> meetingPassword,
          "moderatorPassword" -> moderatorPassword,
          "service" -> ConferenceSystemLabels.BIGBLUEBUTTON
        )
    }
  }

  /**
    * Creates a single unique conference link for bbb.
    * @param req The request object
    * @param res The response object
    * @param body The body of the request.
    * @return The conference link
    */
  @RequestMapping(value = Array("/bigbluebutton/invite"), method = Array(RequestMethod.POST))
  @ResponseBody
  def getBBBConferenceLink(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Map[String, String] = {
    val user = authService.authorize(req, res)
    val inviteeUri: String = this.bbbService.getBBBConferenceLink(user, body.get("meetingId").asText(), body.get("meetingPassword").asText())
    Map("href" -> inviteeUri)
  }
}
