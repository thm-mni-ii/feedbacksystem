package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.{ObjectMapper, SerializationFeature}
import com.fasterxml.jackson.module.scala.DefaultScalaModule

/**
  * XML default scala mappers to deal with xml and maps.
  */
class ScalaObjectMapper extends ObjectMapper  {
    registerModule(DefaultScalaModule)
    configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
    configure(SerializationFeature.WRITE_ENUMS_USING_TO_STRING, true)
    // configure(SerializationFeature.WRITE_ENUMS_USING_INDEX, true)
    //configure(SerializationFeature.WRITE_ENUM_KEYS_USING_INDEX, true)
}
