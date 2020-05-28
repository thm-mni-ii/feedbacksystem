package de.thm.ii.fbs.controller

import de.thm.ii.fbs.services._
import de.thm.ii.fbs.util.ResourceNotFoundException
import javax.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.util.ResourceUtils
import org.springframework.web.bind.annotation._
import scala.io.Source
import scala.util.Using

/**
  * Manages legally required information.
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/legal"))
class LegalController {
  @Autowired
  private implicit val userService: UserService = null

  /**
    * Load the markdown files from file system and display it
    * @param filename markdown file name
    * @param request contain request information
    * @return markdown file content
    */
  @RequestMapping(value = Array("/{filename}"), method = Array(RequestMethod.GET))
  def handleLegalTexts(@PathVariable filename: String, request: HttpServletRequest): Map[String, String] = {
    val filePath = filename match {
      case "impressum" => Some("impressum.md")
      case "privacy_text" => Some("privacy_text.md")
      case _ => None
    }

    if (filePath.isDefined) {
      val text = Using(Source.fromResource(filePath.get)) {s => s.mkString}
      if (text.isFailure) {
        throw new Exception(s"Could not read $filePath")
      } else {
        Map("markdown" -> text.get)
      }
    } else {
      throw new ResourceNotFoundException
    }
  }
}
