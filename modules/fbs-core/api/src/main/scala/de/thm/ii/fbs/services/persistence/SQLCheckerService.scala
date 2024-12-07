package de.thm.ii.fbs.services.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.{ArrayNode, ObjectNode}
import de.thm.ii.fbs.model.{SQLCheckerQuery, SQLCheckerSolution}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria.where
import org.springframework.data.mongodb.core.query.{Criteria, Query, Update}
import org.springframework.stereotype.Component

@Component
class SQLCheckerService {
  val QueryCollectionName = "Queries"
  val SolutionCollectionName = "Solutions"
  val ProAttributesCollectionName = "ProAttributes"
  val SelAttributesCollectionName = "SelAttributes"
  val StringsCollectionName = "Strings"
  val TablesCollectionName = "Tables"

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

  def setSolution(id: String, taskNumber: Int, statement: String): Unit = {
    val solution = new Update()
    solution.setOnInsert("id", id)
    solution.setOnInsert("taskNumber", taskNumber)
    solution.set("statement", statement)
    val query = new Query()
    query.addCriteria(where("taskNumber").is(taskNumber))

    mongodbTemplate.upsert(query, solution, SolutionCollectionName)
  }

  def getQuery(submissionId: Int): Option[SQLCheckerQuery] = {
    val query = new Query()
    query.`with`(Sort.by(Sort.Direction.DESC, "$natural"))
    query.addCriteria(where("submissionId").is(submissionId))

    Option(mongodbTemplate.findOne(query, classOf[SQLCheckerQuery], QueryCollectionName))
  }

  def deleteSolutions(taskNumber: Int): Unit = {
    val query = new Query()
    query.addCriteria(where("taskNumber").is(taskNumber))

    Option(mongodbTemplate.findAndRemove(query, classOf[SQLCheckerSolution], SolutionCollectionName)) match {
      case Some(solution) =>
        val idQuery = new Query()
        idQuery.addCriteria(where("id").is(solution.id))

        mongodbTemplate.remove(idQuery, ProAttributesCollectionName)
        mongodbTemplate.remove(idQuery, QueryCollectionName)
        mongodbTemplate.remove(idQuery, SelAttributesCollectionName)
        mongodbTemplate.remove(idQuery, StringsCollectionName)
        mongodbTemplate.remove(idQuery, TablesCollectionName)
      case _ =>
    }
  }

  private def buildCoreQuery(taskID: Int) =
    new Query()
      .addCriteria(where("taskNumber").is(taskID))
      .addCriteria(where("queryRight").is(false))
      .addCriteria(where("parsable").is(true))

  private def buildSumUpCorrectQuery(taskID: Int, additionalAttributeName: String, additionalAttributeValue: Boolean) =
    buildCoreQuery(taskID)
      .addCriteria(additionalAttributeName match {
        case "attributesRight" => buildAttributesRightCondition(additionalAttributeValue)
        case _ => where(additionalAttributeName).is(additionalAttributeValue)
      })

  private def buildSumUpCorrectCombinedQuery(taskID: Int, tablesRight: Boolean, attributesRight: Boolean) =
    buildCoreQuery(taskID)
      .addCriteria(where("tablesRight").is(tablesRight))
      .addCriteria(buildAttributesRightCondition(attributesRight))

  private def buildAttributesRightCondition(attributesRight: Boolean) = if (attributesRight) {
    new Criteria().andOperator(where("proAttributesRight").is(true), where("selAttributesRight").is(true))
  } else {
    new Criteria().orOperator(where("proAttributesRight").is(false), where("selAttributesRight").is(false))
  }
}
