package de.thm.ii.fbs.services

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

  private def buildTableJson(resultSet: Option[ResultSet]) = {
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
  def buildCompareTable(results: (Option[ResultSet], Option[ResultSet])): Option[JsonObject] = {
    val res = new JsonObject
    val expectedTable = buildTableJson(results._1)
    val resultTable = buildTableJson(results._2)

    res
      .put("type", COMPARE_TABLE_TYPE)
      .put("expected", expectedTable)
      .put("result", resultTable)

    if (results._1.isEmpty && results._2.isEmpty) None else Option(res)
  }
}
