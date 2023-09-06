package de.thm.ii.fbs.controller

import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.services.security.AuthService
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import de.thm.ii.fbs.utils.v2.security.authorization.{IsSelf, PermitAll}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation._

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.io.Source
import scala.util.{Success, Using}

/**
  * Manages legally required information.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/legal"))
class LegalController {
  @Autowired
  private implicit val userService: UserService = null
  @Autowired
  private val authService: AuthService = null

  /**
    * Load the markdown files from file system and display it
    *
    * @param filename markdown file name
    * @param request  contain request information
    * @return markdown file content
    */
  @GetMapping(value = Array("/{filename}"))
  @ResponseBody
  @PermitAll
  def legalTexts(@PathVariable filename: String, request: HttpServletRequest): Map[String, String] = {
    val filePath = filename match {
      case "impressum" => Some("impressum.md")
      case "privacy-text" => Some("privacy_text.md")
      case _ => None
    }
    filePath match {
      case Some(path) =>
        Using(Source.fromResource(path)) { s => s.mkString }.map(text => Map("markdown" -> text)) match {
          case Success(res) => res
          case _ => throw new Exception(s"Could not read $path")
        }
      case None => throw new ResourceNotFoundException
    }
  }

  /**
    * Get the information if a user has accepted the terms of use
    *
    * @param userId User id
    * @param req request
    * @param res response
    * @return response content
    */
  @GetMapping(value = Array("/termsofuse/{userId}"))
  @ResponseBody
  @IsSelf
  def getTermsOfUseAcceptanceStatus(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse): Map[String, Boolean] =
    Map("accepted" -> userService.getPrivacyStatusOf(userId))

  /**
    * Accept the terms of use
    *
    * @param userId User id
    * @param req request
    * @param res response
    */
  @PutMapping(value = Array("/termsofuse/{userId}"))
  @IsSelf
  def acceptTermsOfUse(@PathVariable userId: Int, req: HttpServletRequest, res: HttpServletResponse): Unit =
    userService.updateAgreementToPrivacyFor(userId, true)
}
