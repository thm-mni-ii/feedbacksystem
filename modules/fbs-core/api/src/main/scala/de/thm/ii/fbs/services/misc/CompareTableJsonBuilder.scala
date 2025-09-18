package de.thm.ii.fbs.services.misc

import de.thm.ii.fbs.model.checker.sqlRunner.ResultSet
import org.json.{JSONArray, JSONObject}

import scala.jdk.CollectionConverters.SeqHasAsJava

object CompareTableJsonBuilder {
  def resultSetToJson(rs: ResultSet): JSONObject = {
    val obj = new JSONObject()
    obj.put("head", rs.columns.asJava)
    val rowsArray = new JSONArray()
    rs.rows.foreach(row => rowsArray.put(row.asJava))
    obj.put("rows", rowsArray)
    obj
  }

  def buildCompareTable(result: ResultSet, expected: ResultSet, ignoreOrder: Boolean): JSONObject = {
    val obj = new JSONObject()
    obj.put("type", "compareTable")
    obj.put("result", resultSetToJson(result))
    obj.put("expected", resultSetToJson(expected))
    obj.put("ignoreOrder", ignoreOrder)
    obj
  }
}
