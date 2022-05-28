package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.{JsonNode, ObjectMapper}
import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import de.thm.ii.fbs.model.SQLCheckerQuery
import org.bson.Document
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria.where
import org.springframework.data.mongodb.core.query.Query
import org.springframework.stereotype.Component

import java.util.stream.Collectors.toList

@Component
class SQLCheckerService {
  val QueryCollectionName = "Queries"
  val SolutionCollectionName = "Solutions"
  @Autowired
  private val mongodbTemplate: MongoTemplate = null
  @Autowired
  private val mapper: ObjectMapper = null

  def sumUpCorrect(taskID: Int, returns: String): ObjectNode = {
    val attributeName = returns match {
      case "tables" => "tablesRight"
      case "attributes" => "attributesRight"
    }

    val trueCount = mongodbTemplate.count(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = true), QueryCollectionName)
    val falseCount = mongodbTemplate.count(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = false), QueryCollectionName)

    mapper.createObjectNode().put("trueCount", trueCount).put("falseCount", falseCount)
  }

  def sumUpCorrectCombined(taskID: Int, returns: String): ObjectNode = {
    val tablesRight = returns == "tables"
    val attributesRight = returns == "attributes"

    val trueCount = mongodbTemplate.count(buildSumUpCorrectCombinedQuery(taskID, tablesRight = true, attributesRight = true), QueryCollectionName)
    val falseCount = mongodbTemplate.count(buildSumUpCorrectCombinedQuery(taskID, tablesRight, attributesRight), QueryCollectionName)

    mapper.createObjectNode().put("trueCount", trueCount).put("falseCount", falseCount)
  }

  def listByType(taskID: Int, returns: String): ArrayNode = {
    val attributeName = returns match {
      case "tables" => "tablesRight"
      case "attributes" => "attributesRight"
    }

    val results = mongodbTemplate.find(buildSumUpCorrectQuery(taskID, attributeName, additionalAttributeValue = false),
      classOf[SQLCheckerQuery], QueryCollectionName)

    val result = mapper.createArrayNode()

    results.forEach(res => result.add(mapper.convertValue(res, classOf[ObjectNode])))

    result
  }

  def listByTypes(taskID: Int, tables: Boolean, attributes: Boolean): ArrayNode = {
    val results = mongodbTemplate.find(buildSumUpCorrectCombinedQuery(taskID, tables, attributes), classOf[SQLCheckerQuery], QueryCollectionName)

    val result = mapper.createArrayNode()

    results.forEach(res => result.add(mapper.convertValue(res, classOf[ObjectNode])))

    result
  }

  def createSolution(id: String, taskNumber: Int, statement: String): Unit = {
    val solution = new Document()
    solution.put("id", id)
    solution.put("taskNumber", taskNumber)
    solution.put("statement", statement)

    mongodbTemplate.insert(solution, SolutionCollectionName)
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
