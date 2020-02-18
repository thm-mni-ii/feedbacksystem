package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule

/**
  * XML default scala mappers to deal with xml and maps.
  * @author Andrej Sajenko
  */
class ScalaObjectMapper extends ObjectMapper  {
    registerModule(DefaultScalaModule)
}
