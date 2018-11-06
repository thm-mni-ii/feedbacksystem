package de.thm.ii.submissioncheck

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.SpringApplication

/**
  * Class dummy for sprint boot.
  *
  * @author Andrej Sajenko
  */
@SpringBootApplication
class Application

/**
  * Boot webservice to handle user comminication over a REST Service.
  *
  * @author Andrej Sajenko
  */
object Application extends App {
  SpringApplication.run(classOf[Application])
}
