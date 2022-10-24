package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.JsonNode

/**
  * Allow save retrivement of textrual attributes.
  *
  * @param jsonNode Wrapp json
  */
class JsonWrapper(jsonNode: JsonNode) {
  /**
    * @return Return textual representation of the node or none
    */
  def asText(): Option[String] = if (isNotNull) Option(jsonNode.asText()) else Option.empty

  /**
    * @return Return integer representation of the node or none
    */
  def asInt(): Option[Int] = if (isNotNull) Option(jsonNode.asInt()) else Option.empty

  /**
    * @return Return boolean representation of the node or none
    */
  def asBool(): Option[Boolean] = if (isNotNull) Option(jsonNode.asBoolean()) else Option.empty

  /**
    * @return Return long representation of the node or none
    */
  def asLong(): Option[Long] = if (isNotNull) Option(jsonNode.asLong()) else Option.empty

  /**
    * @return Return a json object or none
    */
  def asObject(): Option[JsonNode] = if (isNotNull) Option(jsonNode) else Option.empty

  /**
    * Retrive a key from json object if the json object is not null
    *
    * @param key Key to access
    * @return JsonWrapper
    */
  def retrive(key: String): JsonWrapper = {
    if (isNotNull) {
      new JsonWrapper(jsonNode.get(key))
    } else {
      this
    }
  }

  /**
    * Check if the json node is not null and not of type NullNode
    */
  private def isNotNull = {
    jsonNode != null && !jsonNode.isNull
  }
}

/**
  * Conversion object for com.fasterxml.jackson.databind.JsonNode
  *
  * @author Andrej Sajenko
  */
object JsonWrapper {
  /**
    * Converts to json wrapper.
    *
    * @param jsonNode JsonNode from faster xml jackson
    * @return The wrapper.
    */
  implicit def jsonNodeToWrapper(jsonNode: JsonNode): JsonWrapper = new JsonWrapper(jsonNode)
}
