package de.thm.ii.fbs.model.checker.sqlRunner

import org.json.{JSONArray, JSONObject}

case class ResultSet(
                      columns: Seq[String],
                      rows: Seq[Seq[Any]]
                    )
object ResultSet {
  def parseSqlRow(rowArr: JSONArray): Seq[Any] =
    (0 until rowArr.length()).map(i => rowArr.get(i))

  def parseRows(rowsArr: JSONArray): Seq[Seq[Any]] =
    (0 until rowsArr.length()).map(i => parseSqlRow(rowsArr.getJSONArray(i)))

  def fromJson(js: JSONObject): ResultSet = {
    val columnsArr = js.getJSONArray("columns")
    val columns = (0 until columnsArr.length()).map(columnsArr.getString)
    val rowsArr = js.getJSONArray("rows")
    val rows = parseRows(rowsArr)
    ResultSet(columns, rows)
  }

  def empty: ResultSet = ResultSet(Seq(), Seq())
}
