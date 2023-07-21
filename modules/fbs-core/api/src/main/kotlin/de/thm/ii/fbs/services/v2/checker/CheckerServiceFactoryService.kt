package de.thm.ii.fbs.services.v2.checker

import de.thm.ii.fbs.services.v2.checker.trait.CheckerService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.stereotype.Service
@Service
class CheckerServiceFactoryService {
    @Autowired
    lateinit var applicationContext: ApplicationContext

    /**
     * Gets a checker for the given service
     * @param service the service to get a checker for
     * @return the checker
     */
    fun apply(service: String): CheckerService {
        return when(service)  {
            "spreadsheet" -> applicationContext.getBean(classOf[SpreadsheetCheckerService])
            "excel" -> applicationContext.getBean(classOf[ExcelCheckerService])
            "sql-checker" -> applicationContext.getBean(classOf[SqlCheckerRemoteCheckerService])
            else -> applicationContext.getBean(classOf[RemoteCheckerService])
        }
    }
}