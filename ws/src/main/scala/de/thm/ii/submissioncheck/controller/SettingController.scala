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
import scala.io.Source

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

  private val LABEL_SUCCESS = "success"

  /**
    * Set value if a privacy message has to be shown
    * @author Benjamin Manns
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/show"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def updatePrivacyShow(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 1) {
        throw new UnauthorizedException
    }
    try {
      val enable = jsonNode.get("enable").asBoolean()
      Map(LABEL_SUCCESS -> settingService.insertOrUpdateSetting("privacy.show", enable, "BOOL"))
      // TODO set or insert privacy set show on or off
    } catch {
      case _: NullPointerException => throw new BadRequestException("")
      case e: NotImplementedError => throw new BadRequestException(e.getMessage)
    }
  }

  /** Set value if a privacy message has to be shown
    * @author Benjamin Manns
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/show"), method = Array(RequestMethod.GET))
  def getPrivacyShow(request: HttpServletRequest): Map[String, Boolean] = {
    val user = userService.verifyUserByHeaderToken(request)
    if (user.isEmpty || user.get.roleid > 1) {
      throw new UnauthorizedException
    }
    val settingsPrivacyShow = settingService.loadSetting("privacy.show")
    Map("show" -> (if (settingsPrivacyShow.isDefined) settingsPrivacyShow.get.asInstanceOf[Boolean] else true))
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
    val user = userService.verifyUserByHeaderToken(request)
    if(user.isEmpty || user.get.roleid > 1) { // only ADMIN or MODERATOR can create a course
      throw new UnauthorizedException
    }
    try {
      val which = jsonNode.get("which").asText()
      val content = jsonNode.get("content").asText()
      Map(LABEL_SUCCESS -> settingService.insertOrUpdateSetting("privacy." + which, content, "TEXT"))
    } catch {
      case _: NullPointerException => throw new BadRequestException("")
      case e: NotImplementedError => throw new BadRequestException(e.getMessage)
    }
  }

  /**
    * load the markdown files from file system and display it
    * @param file_name markdown file name
    * @param request contain request information
    * @return markdown file content
    */
  @RequestMapping(value = Array("markdown/{file_name}"), method = Array(RequestMethod.GET))
  def getMarkdownImpressum(@PathVariable file_name: String, request: HttpServletRequest): Map[String, String] = {
    val basePath = "/usr/local/appconfig/markdown/"

    val filePath = basePath + (file_name match {
      case "impressum" => "impressum.md"
      case "privacy_text" => "privacy_text.md"
      case whoa: Any => ""
    })
    Map("markdown" -> Source.fromFile(filePath).mkString)
  }

  /**
    * Set privacy / impressum texts stored in settings
    * @author Benjamin Manns
    * @param request contain request information
    * @param which choose which provacy test should be loaded
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/text"), method = Array(RequestMethod.GET))
  def getPrivacyText(request: HttpServletRequest, @RequestParam(value = "which", required = true) which: String): Map[String, Any] = {
    // Everyone can read this information
    val allowedKeys = List("impressum_text", "privacy_text")
    if (!allowedKeys.contains(which)) {
      throw new BadRequestException("Please choose as parameter `which` one of: (" + allowedKeys.map(f => f + ",") + ")")
    }
    Map("markdown" -> settingService.loadSetting("privacy." + which).getOrElse(""))
  }
}
