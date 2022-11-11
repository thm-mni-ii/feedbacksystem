package de.thm.ii.fbs.services

import de.thm.ii.fbs.types.ExtResSql
import io.vertx.core.json.JsonObject
import io.vertx.lang.scala.json.JsonArray
import io.vertx.scala.ext.sql.ResultSet

/**
  * Generate all ExtendedResult json
  *
  * @author Max Stephan
  */
object ExtendedResultsService {
  private val COMPARE_TABLE_TYPE = "compareTable"

  /**
    * Create a table from a result set
    *
    * @param resultSet Result Set to Transform
    * @return the Result Set as an Table
    */
  def buildTableJson(resultSet: Option[ResultSet]): JsonObject = {
    val table = new JsonObject

    if (resultSet.isDefined) {
      /* Transform Result set to json structure */
      val expectedHead = new JsonArray()
      resultSet.get.getColumnNames.foreach(n => expectedHead.add(n))
      val expectedRes = new JsonArray()
      resultSet.get.getResults.foreach(r => expectedRes.add(r))

      table
        .put("head", expectedHead)
        .put("rows", expectedRes)
    } else {
      table
    }
  }

  /**
    * Generates the Json Structure for the type `CompareTable`
    *
    * @param results SQL Runner results
    * @return Json structure
    */
  def buildCompareTable(results: ExtResSql): Option[JsonObject] = {
    val res = new JsonObject
    val expectedTable = buildTableJson(results.expected)
    val resultTable = buildTableJson(results.result)

    res
      .put("type", COMPARE_TABLE_TYPE)
      .put("ignoreOrder", results.variable)
      .put("expected", expectedTable)
      .put("result", resultTable)

    if (results.expected.isEmpty && results.result.isEmpty) None else Option(res)
  }
}
