package de.thm.ii.submissioncheck.services

import net.unicon.cas.client.configuration.EnableCasClient
import org.springframework.web.bind.annotation.{RequestMapping, RestController}

/**
  * Health check service that provides a static ressource
  * to check if the server respose.
  *
  * @author Andrej Sajenko
  */
@RestController
@EnableCasClient
@RequestMapping(path = Array("/api/health"))
class HealthService {
  /**
    * @return A static message: Alive of everything is okay.
    */
  @RequestMapping(value=Array("/beat"))
  def getBeat(): String = "Alive!"
}
