package de.thm.ii.submissioncheck

import scala.collection.JavaConverters._
import java.util
import com.fasterxml.jackson.databind.ObjectMapper
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
    * mapToJsonStr use Object Mapper
    *
    * @author Benjamin Manns
    * @param jsonMap a Scala Map
    * @return Json String
    */
  implicit def mapToJsonStr(jsonMap: Map[String, String]): String = {
    val map: util.Map[String, String] = jsonMap.asJava
    val mapper = new ObjectMapper
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(map)
    jsonResult
  }
}
