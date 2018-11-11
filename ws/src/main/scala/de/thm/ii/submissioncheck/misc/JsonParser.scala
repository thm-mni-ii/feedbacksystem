package de.thm.ii.submissioncheck.misc

import java.util
import collection.JavaConverters._

import collection.JavaConverters._
import com.fasterxml.jackson.databind.ObjectMapper
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
  def mapToJsonStr(jsonMap: Map[String, String]):String = {
    val map:util.Map[String,String] = jsonMap.asJava
    val mapper = new ObjectMapper
    val jsonResult = mapper.writerWithDefaultPrettyPrinter.writeValueAsString(map)
    jsonResult
  }
}
