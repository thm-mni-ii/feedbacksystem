package de.thm.ii.fbs.services

import de.thm.ii.fbs.types.ExtResSql
import io.vertx.lang.scala.json.JsonArray
import io.vertx.scala.ext.sql.ResultSet
import org.hamcrest.CoreMatchers.is
import org.junit.Assert.{assertEquals, assertNotEquals, assertThat}
import org.junit.Test

import scala.collection.mutable

/**
  * TestClass for the SQLResultService
  */
class SQLResultServiceTest {
  private def getJson0: JsonArray = {
    val json1 = new JsonArray()
    json1.add("test1")
    json1.add(2)
  }

  private def getJson1: JsonArray = {
    val json0 = new JsonArray()
    json0.add("test")
    json0.add(1)
  }

  private def getResultSet: ResultSet = {
    val newRes = ResultSet()

    newRes.setResults(mutable.Buffer(getJson0, getJson1))
    newRes.setColumnNames(mutable.Buffer("t", "t"))
    newRes.setOutput(getJson0)
  }

  private def getResultSetSorted: ResultSet = {
    val newRes = ResultSet()

    newRes.setResults(mutable.Buffer(getJson1, getJson0))
    newRes.setColumnNames(mutable.Buffer("t", "t"))
    newRes.setOutput(getJson0)
  }

  /**
    * Test for the buildExpected function
    */
  @Test
  def buildExpectedTest(): Unit = {
    val extResSQL = new ExtResSql(None, None)
    val expRes = getResultSet

    SQLResultService.buildExpected(extResSQL, expRes, variable = false)

    assertEquals(Option(expRes), extResSQL.expected)
    assertEquals(false, extResSQL.variable)
  }

  /**
    * Test for the buildExpected function
    */
  @Test
  def buildResultTest(): Unit = {
    val extResSql = new ExtResSql(None, None)
    val userRes = getResultSet

    SQLResultService.buildResult(extResSql, userRes, getResultSetSorted, variable = false)

    assertEquals(Option(userRes), extResSql.result)
  }

  /**
    * Test for the buildExpected function with variable = true
    */
  @Test
  def buildResultVariableTest(): Unit = {
    val extResSql = new ExtResSql(None, None)
    val userResSorted = getResultSetSorted

    SQLResultService.buildResult(extResSql, getResultSet, userResSorted, variable = true)

    assertEquals(Option(userResSorted), extResSql.result)
  }

  /**
    * Test for the sortResult function
    */
  @Test
  def sortResultTest(): Unit = {
    val res = getResultSet

    SQLResultService.sortResult(res)

    assertThat(getResultSetSorted.getResults.toList, is(res.getResults.toList))
  }

  /**
    * Test for the copyResult function
    */
  @Test
  def copyResultTest(): Unit = {
    val res = getResultSet
    val newRes = SQLResultService.copyResult(res)

    assertNotEquals(res, newRes)
  }

  /**
    * Test for the emptyResult function
    */
  @Test
  def emptyResultTest(): Unit = {
    val res = SQLResultService.emptyResult()

    // Check if Results Output and ColumnName are not null (throw null pointer exception)
    res.getResults
    res.getOutput
    res.getColumnNames
  }
}
