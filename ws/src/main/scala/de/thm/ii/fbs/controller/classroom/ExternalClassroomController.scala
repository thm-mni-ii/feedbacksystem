package de.thm.ii.fbs.controller.classroom

import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.controller.exception.{BadRequestException, ForbiddenException}
import de.thm.ii.fbs.model.{Course, GlobalRole}
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.{CrossOrigin, PostMapping, RequestBody, RequestMapping, ResponseBody, RestController}

import javax.servlet.http.{HttpServletRequest, HttpServletResponse}

/**
  * External classroom controller
  */
@RestController
@CrossOrigin
@RequestMapping(path = Array("/api/v1/classroom"), produces = Array(MediaType.APPLICATION_JSON_VALUE))
class ExternalClassroomController {
  /**
    * Create a new course
    * @param req http request
    * @param res http response
    * @param body contains JSON request
    * @return JSON
    */
  @PostMapping(value = Array(""), consumes = Array(MediaType.APPLICATION_JSON_VALUE))
  @ResponseBody
  def create(req: HttpServletRequest, res: HttpServletResponse, @RequestBody body: JsonNode): Course = {

  }

}
