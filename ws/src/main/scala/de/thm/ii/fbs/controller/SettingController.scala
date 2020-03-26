package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.services._
import de.thm.ii.fbs.util.{BadRequestException, UnauthorizedException, Users}
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

import scala.io.Source

/**
  * Controller to manage rest api calls for a course resource.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/settings"))
class SettingController {
  @Value("${markdown.base-path}")
  private val basePath = "/usr/local/appconfig/markdown/"

  @Autowired
  private val settingService: SettingService = null
  @Autowired
  private implicit val userService: UserService = null

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
    } try {
      val enable = jsonNode.get("enable").asBoolean()
      Map(LABEL_SUCCESS -> settingService.insertOrUpdateSetting("privacy.show", enable, "BOOL"))
      // TODO set or insert privacy set show on or off
    } catch {
      case _: NullPointerException => throw new BadRequestException("")
      case e: NotImplementedError => throw new BadRequestException(e.getMessage)
    }
  }

  /**
    * create a new settings entry
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return success state
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def createNewSetting(request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid > 1) {
      throw new UnauthorizedException
    } try {
      val key = jsonNode.get("key").asText()
      val value = jsonNode.get("val").asText()
      val typ = jsonNode.get("typ").asText()

      Map(LABEL_SUCCESS -> settingService.insertOrUpdateSetting(key, value, typ))
    } catch {
      case _: NullPointerException => throw new BadRequestException("JSON Request need this three keys: (key, val, typ)")
      case e: Exception => throw new BadRequestException(e.toString)
    }
  }

  /**
    * update an existing entry
    * @param settingskey key of entry
    * @param request Request Header containing Headers
    * @param jsonNode contains JSON request
    * @return success state
    */
  @RequestMapping(value = Array("{settingskey}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def updateSetting(@PathVariable settingskey: String, request: HttpServletRequest, @RequestBody jsonNode: JsonNode): Map[String, Boolean] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid > 1) {
      throw new UnauthorizedException
    } try {
      val value = jsonNode.get("val").asText()
      val typ = jsonNode.get("typ").asText()

      Map(LABEL_SUCCESS -> settingService.insertOrUpdateSetting(settingskey, value, typ))
    } catch {
      case _: NullPointerException => throw new BadRequestException("JSON Request need this three keys: (val, typ)")
      case e: Exception => throw new BadRequestException(e.toString)
    }
  }

  /**
    * delete a settings entry
    * @param settingskey key of entry
    * @param request Request Header containing Headers
    * @return success state
    */
  @RequestMapping(value = Array("{settingskey}"), method = Array(RequestMethod.DELETE))
  def deleteSetting(@PathVariable settingskey: String, request: HttpServletRequest): Map[String, Boolean] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid > 1) {
      throw new UnauthorizedException
    }

    Map(LABEL_SUCCESS -> settingService.deleteByKey(settingskey))
  }

  /**
    * get all entries
    * @param request Request Header containing Headers
    * @return list of all entries
    */
  @RequestMapping(value = Array(""), method = Array(RequestMethod.GET))
  def getAllSetting(request: HttpServletRequest): List[Map[String, Any]] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid > 1) {
      throw new UnauthorizedException
    }

    try {
      settingService.getAll()
    } catch {
      case e: Exception => throw new BadRequestException(e.toString)
    }
  }

  /** Set value if a privacy message has to be shown
    * @author Benjamin Manns
    * @param request Request Header containing Headers
    * @return JSON
    */
  @RequestMapping(value = Array("privacy/show"), method = Array(RequestMethod.GET))
  def getPrivacyShow(request: HttpServletRequest): Map[String, Boolean] = {
    val user = Users.claimAuthorization(request)
    if (user.roleid > 1) {
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
    val user = Users.claimAuthorization(request)
    if(user.roleid > 1) { // only ADMIN or MODERATOR can create a course
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
