package de.thm.ii.fbs.services.checker

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.stereotype.Service

/**
  * A Factory for Checker Services
  */
@Service
class CheckerServiceFactoryService {
  @Autowired
  private val applicationContext: ApplicationContext = null

  /**
    * Gets a checker for the given service
    * @param service the service to get a checker for
    * @return the checker
    */
  def apply(service: String): CheckerService = service match {
    case "spreadsheet" => applicationContext.getBean(classOf[SpreadsheetCheckerService])
    case _: String => applicationContext.getBean(classOf[RemoteCheckerService])
  }
}
