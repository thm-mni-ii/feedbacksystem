package de.thm.ii.submissioncheck.controller

import java.nio.file.{Files, Path, Paths}
import java.util.zip.{ZipEntry, ZipOutputStream}
import java.{io, util}

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.submissioncheck.misc.{BadRequestException, ResourceNotFoundException, UnauthorizedException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import de.thm.ii.submissioncheck.services._
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.UrlResource
import org.springframework.http.{HttpHeaders, MediaType, ResponseEntity}
import org.springframework.kafka.core.KafkaTemplate
import org.springframework.web.bind.annotation._

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@RequestMapping(path = Array("/api/v1/settings"))
class SettingController {
  @Autowired
  private val settingService: SettingService = null

  @Autowired
  private val userService: UserService = null

  private val LABEL_UPADATE = "update"

  /**
    * Set value if a privacy message has to be shown
    * @author Benjamin Manns
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/show"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updatePrivacyShow(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 1) {
        throw new UnauthorizedException
    }
    try {
      val enable = jsonNode.get("enable").asBoolean()
      Map(LABEL_UPADATE -> settingService.insertOrUpdateSetting("privacy.show", enable, "BOOL"))
      // TODO set or insert privacy set show on or off
    } catch {
      case _: NullPointerException => throw new BadRequestException("")
      case e: NotImplementedError => throw new BadRequestException(e.getMessage)
    }
  }

  /**
    * Set value of privacy / impressum text
    * @author Benjamin Manns
    * @param request contain request information
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/text"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updatePrivacyText(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verfiyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 1) { // only ADMIN or MODERATOR can create a course
      throw new UnauthorizedException
    }
    try {
      val which = jsonNode.get("which").asText()
      val content = jsonNode.get("content").asText()
      Map(LABEL_UPADATE -> settingService.insertOrUpdateSetting("privacy." + which, content, "TEXT"))
    } catch {
      case _: NullPointerException => throw new BadRequestException("")
      case e: NotImplementedError => throw new BadRequestException(e.getMessage)
    }
  }

}
