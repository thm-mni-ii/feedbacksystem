package de.thm.ii.submissioncheck.services

import org.springframework.web.bind.annotation.{RequestMapping, RestController}

@RestController
@RequestMapping(path = Array("/api/health"))
class HealthService {
  @RequestMapping(value=Array("/beat"))
  def getBeat() = "Alive!"
}
