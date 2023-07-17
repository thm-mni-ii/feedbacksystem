package de.thm.ii.fbs.services.checker.math

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.mathParser.MathParserHelper
import org.junit.{Assert, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

import scala.collection.immutable
import scala.jdk.CollectionConverters.MapHasAsJava
import java.util.{Map => UtilMap}

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
@ActiveProfiles(Array("test"))
class SpreadsheetCheckerServiceTest {
  @Autowired
  val spreadsheetCheckerService: SpreadsheetCheckerService = null

  private def compareMock(enteredValue: String, value: String, decimals: Int): Boolean = spreadsheetCheckerService.compare(
    enteredValue,
    value,
    decimals
  )

  private def checkMock(fields: Seq[(String, String)], submittedFields: UtilMap[String, String], decimals: Int):
    (Int, Seq[spreadsheetCheckerService.CheckResult]) =
    spreadsheetCheckerService.check(
      fields.map(t => (t._1, t._2)),
      submittedFields.entrySet().toArray(Array[UtilMap.Entry[String, String]]())
        .map((t: UtilMap.Entry[String, String]) => t.getKey -> t.getValue).toMap.asJava,
      decimals
    )

  @Test
  def decimalCompareTest(): Unit = {
    Assert.assertTrue(compareMock("1,234", "1,234", 3))
    Assert.assertTrue(compareMock("1,23456", "1,23456", 3))
    Assert.assertTrue(compareMock("1,23456", "1,235", 3))
    Assert.assertFalse(compareMock("1,23456", "1,24", 4))
    Assert.assertFalse(compareMock("1,23456", "1,23", 4))
    Assert.assertFalse(compareMock("1,23456", "1,2345", 4))
  }

  @Test
  def mathCompareTest(): Unit = {
    Assert.assertTrue(compareMock("1+2+3", "3+2+1", 2))
    Assert.assertTrue(compareMock("2+a", "2+1a", 2))
    Assert.assertTrue(compareMock("abc", "a*b*c", 2))
    Assert.assertTrue(compareMock("a*2,51", "2,5*a", 1))
    Assert.assertFalse(compareMock("1+2+3", "3+2*1", 2))
    Assert.assertFalse(compareMock("2+a", "2+2a", 2))
    Assert.assertFalse(compareMock("abc", "a*b*d", 2))
    Assert.assertFalse(compareMock("a*2,56", "2,5*a", 1))
  }

  @Test
  def mathCheckTest(): Unit = {
    val fields = immutable.Seq(("a)", "7a-8b"), ("b)", "4,8b-0,3a"))
    val submittedCorrect = immutable.Map("a)" -> "7a-8b", "b)" -> "4,8b-0,3a").asJava
    val submittedWrong = immutable.Map("a)" -> "7a-8b", "b)" -> "4,8b-0,4a").asJava
    val (status1, _) = checkMock(fields, submittedCorrect, 2)
    Assert.assertEquals(2, status1)
    val (status2, _) = checkMock(fields, submittedWrong, 2)
    Assert.assertEquals(1, status2)
  }
}
