package de.thm.ii.fbs.controller

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.services.security.AuthService
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation._

/**
  * UserController defines all routes for /users (insert, delete, update)
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/courses"))
class CheckerConfigurationController {
  @Autowired
  private val authService: AuthService = null

  @RequestMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations"), method = Array(RequestMethod.GET))
  def getAll(req: HttpServletRequest, res: HttpServletResponse): List[CheckerConfigurationController] = {
    val user = authService.authorize(req, res)


  }

  @RequestMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations"), method = Array(RequestMethod.POST), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): CheckerConfigurationController = ???

  @RequestMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}"), method = Array(RequestMethod.PUT), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  def update(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Unit = ???

  @RequestMapping(value = Array("/{cid}/tasks/{tid}/checker-configurations/{ccid}"), method = Array(RequestMethod.DELETE))
  def delete(@PathVariable uid: Int, req: HttpServletRequest, res: HttpServletResponse): Unit = ???
}
