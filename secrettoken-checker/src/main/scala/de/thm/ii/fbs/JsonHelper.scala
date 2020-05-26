package de.thm.ii.fbs

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import org.json4s.jackson.JsonMethods.parse

/**
  * Provides functions to transform json to map and map to json.
  * @author Andrej Sajenko
  */
object JsonHelper {
  /**
    * jsonStrToMap use json4s to parse a json string
    *
    * @author Benjamin Manns
    * @param jsonStr a json String
    * @return Scala Map
    */
  implicit def jsonStrToMap(jsonStr: String): Map[String, Any] = {
    implicit val formats = org.json4s.DefaultFormats
    parse(jsonStr).extract[Map[String, Any]]
  }

  /**
    * parse any JSON String to ANY object, has to be cast later on
    * @author Benjamin Manns
    * @param jsonStr a json String
    * @return Scala Object
    */
  implicit def jsonStrToAny(jsonStr: String): Any = {
    implicit val formats = org.json4s.DefaultFormats
    try {
      parse(jsonStr).extract[Any]
    } catch {
      case e: Exception => {
        null
      }
    }
  }

  /**
    * parse a string to a List of Any
    * @param jsonStr a JSON String
    * @return Scala List
    */
  implicit def jsonStrToList(jsonStr: String): List[Any] = {
    implicit val formats = org.json4s.DefaultFormats
    parse(jsonStr).extract[List[Any]]
  }

  /**
    * mapToJsonStr use Object Mapper
    *
    * @author Benjamin Manns
    * @param jsonMap a Scala Map
    * @return Json String
    */
  implicit def mapToJsonStr(jsonMap: Map[String, Any]): String = {
    val mapper = new ObjectMapper() with ScalaObjectMapper
    mapper.registerModule(DefaultScalaModule)
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(jsonMap)
    jsonResult
  }

  /**
    * @author Benjamin Manns
    * @param jsonList a Scala List
    * @return JSON String
    */
  implicit def listToJsonStr(jsonList: List[Any]): String = {
    val mapper = new ObjectMapper() with ScalaObjectMapper
    mapper.registerModule(DefaultScalaModule)
    mapper.writerWithDefaultPrettyPrinter.writeValueAsString(jsonList)
  }

  /**
    * @author Benjamin Manns
    * @param jsonList a Scala List
    * @return JSON String
    */
  implicit def anyToJsonStr(jsonList: Any): String = {
    val mapper = new ObjectMapper() with ScalaObjectMapper
    mapper.registerModule(DefaultScalaModule)
    mapper.writerWithDefaultPrettyPrinter.writeValueAsString(jsonList)
  }
}
