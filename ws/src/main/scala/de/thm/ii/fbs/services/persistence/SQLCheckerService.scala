package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria.where
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Component

@Component
class SQLCheckerService {
  val CollectionName = "Queries"
  @Autowired
  private val mongodbTemplate: MongoTemplate = null
  @Autowired
  private val mapper: ObjectMapper = null

  def sumUpCorrect(taskID: Int, returns: String): ObjectNode = {
    val attributeName = returns match {
      case "tables" => "tablesRight"
      case "attributes" => "attributesRight"
    }

    val trueCount = mongodbTemplate.count(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = true), CollectionName)
    val falseCount = mongodbTemplate.count(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = false), CollectionName)

    mapper.createObjectNode().put("trueCount", trueCount).put("falseCount", falseCount)
  }

  def sumUpCorrectCombined(taskID: Int, returns: String): ObjectNode = {
    val tablesRight = returns == "tables"
    val attributesRight = returns == "attributes"

    val trueCount = mongodbTemplate.count(buildSumUpCorrectCombinedQuery(taskID, tablesRight = true, attributesRight = true), CollectionName)
    val falseCount = mongodbTemplate.count(buildSumUpCorrectCombinedQuery(taskID, tablesRight, attributesRight), CollectionName)

    mapper.createObjectNode().put("trueCount", trueCount).put("falseCount", falseCount)
  }

  def listByType(taskID: Int, returns: String): ArrayNode = {
    val attributeName = returns match {
      case "tables" => "tablesRight"
      case "attributes" => "attributesRight"
    }

    val result = mongodbTemplate.find(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = false), classOf[ObjectNode], CollectionName)

    mapper.createArrayNode().addAll(result)
  }

  def listByTypes(taskID: Int, tables: Boolean, attributes: Boolean): ArrayNode = {
    val result = mongodbTemplate.find(buildSumUpCorrectCombinedQuery(taskID, tables, attributes), classOf[ObjectNode], CollectionName)

    mapper.createArrayNode().addAll(result)
  }

  private def buildCoreQuery(taskID: Int) =
    new Query()
      .addCriteria(where("taskNumber").is(taskID))
      .addCriteria(where("queryRight").is(false))
      .addCriteria(where("parsable").is(true))

  private def buildSumUpCorrectQuery(taskID: Int, additionalAttributeName: String, additionalAttributeValue: Boolean) =
    buildCoreQuery(taskID)
      .addCriteria(where(additionalAttributeName).is(additionalAttributeValue))

  private def buildSumUpCorrectCombinedQuery(taskID: Int, tablesRight: Boolean, attributesRight: Boolean) =
    buildCoreQuery(taskID)
      .addCriteria(where("tablesRight").is(tablesRight))
      .addCriteria(where("attributesRight").is(attributesRight))
}
