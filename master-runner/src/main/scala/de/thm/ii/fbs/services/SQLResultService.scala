package de.thm.ii.fbs.services

import de.thm.ii.fbs.types.ExtResSql
import io.vertx.lang.scala.json.JsonArray
import io.vertx.scala.ext.sql.ResultSet

import scala.collection.mutable

/**
  * Helper object to manipulate SQL Results
  * @author Max Stephan
  */
object SQLResultService {
  private def sortJsonArray(x: JsonArray, y: JsonArray) = {
    x.encode().compareTo(y.encode())
  }

  /**
    * Built the Expected Result
    * @param extResSql the object to store the Expected Result
    * @param res  the Expected Result
    * @param variable define if the Results will be compared without order
    */
  def buildExpected(extResSql: ExtResSql, res: ResultSet, variable: Boolean): Unit = {
    extResSql.expected = Option(res)
    extResSql.variable = variable
  }

  /**
    * Built the user Result
    * @param extResSql the object to store the Expected Result
    * @param res the User Result
    * @param resSorted the Sorted User Result
    * @param variable define if the Results will be compared without order
    */
  def buildResult(extResSql: ExtResSql, res: ResultSet, resSorted: ResultSet, variable: Boolean): Unit =
    extResSql.result = Option(if (variable) resSorted else res)

  /**
    * Sort a ResultSet
    * @param res the ResultSet to sort
    * @return the sorted ResultSet
    */
  def sortResult(res: ResultSet): ResultSet =
    res.setResults(res.getResults.sorted(sortJsonArray))

  /**
    * Copy a ResultSet
    * @param res the ResultSet to Copy
    * @return a Copy of res
    */
  def copyResult(res: ResultSet): ResultSet = {
    val newRes = ResultSet()

    newRes.setResults(res.getResults)
    newRes.setColumnNames(res.getColumnNames)
    newRes.setOutput(res.getOutput)
  }

  /**
    * Build a new Empty ResultSet
    * @return an Empty ResultSet
    */
  def emptyResult(): ResultSet = {
    val newRes = ResultSet()

    newRes.setResults(mutable.Buffer())
    newRes.setColumnNames(mutable.Buffer())
    newRes.setOutput(new JsonArray())
  }
}
