package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.JsonNode

/**
  * Allow save retrivement of textrual attributes.
  * @author Andrej Sajenko
  * @param jsonNode Wrapp json
  */
class JsonWrapper(jsonNode: JsonNode) {
  /**
    * @return Return textual representation of the node or null
    */
  def asText(): Option[String] = if (jsonNode != null) Option(jsonNode.asText()) else Option.empty
  /**
    * @return Return integer representation of the node or null
    */
  def asInt(): Option[Int] = if (jsonNode != null) Option(jsonNode.asInt()) else Option.empty
  /**
    * @return Return boolean representation of the node or null
    */
  def asBool(): Option[Boolean] = if (jsonNode != null) Option(jsonNode.asBoolean()) else Option.empty

  /**
    * Retrive a key from json object if the json object is not null
    * @param key Key to access
    * @return JsonWrapper
    */
  def retrive(key: String): JsonWrapper = {
    if (jsonNode != null) {
      new JsonWrapper(jsonNode.get(key))
    } else {
      this
    }
  }
}

/**
  * Conversion object for com.fasterxml.jackson.databind.JsonNode
  * @author Andrej Sajenko
  */
object JsonWrapper {
  /**
    * Converts to json wrapper.
    * @param jsonNode JsonNode from faster xml jackson
    * @return The wrapper.
    */
  implicit def jsonNodeToWrapper(jsonNode: JsonNode): JsonWrapper = new JsonWrapper(jsonNode)
}
