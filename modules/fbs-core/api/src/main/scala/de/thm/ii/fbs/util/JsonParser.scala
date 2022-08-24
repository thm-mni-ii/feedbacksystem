package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.SerializationFeature
import org.json4s._
import org.json4s.jackson.JsonMethods._

/**
  *
  * @author Benjamin Manns
  */
object JsonParser {
  /**
    * jsonStrToMap use json4s to parse a json string
    *
    * @author Benjamin Manns
    * @param jsonStr a json String
    * @return Scala Map
    */
  def jsonStrToMap(jsonStr: String): Map[String, Any] = {
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
  def mapToJsonStr(jsonMap: Map[String, Any]): String = {
    val objectMapper = new ScalaObjectMapper
    objectMapper.configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true)
    objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
    val jsonResult = objectMapper.writeValueAsString(jsonMap)
    jsonResult
  }
}
