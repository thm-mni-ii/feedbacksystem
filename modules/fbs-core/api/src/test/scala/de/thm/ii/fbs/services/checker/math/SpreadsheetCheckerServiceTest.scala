package de.thm.ii.fbs.services.checker.math

import de.thm.ii.fbs.TestApplication
import org.junit.{Assert, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

import scala.collection.immutable
import scala.jdk.CollectionConverters.MapHasAsJava

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
class SpreadsheetCheckerServiceTest {
  @Autowired
  private val spreadsheetCheckerService: SpreadsheetCheckerService = null

  @Test
  def decimalCompareTest(): Unit = {
    Assert.assertTrue(spreadsheetCheckerService.compare("1,234", "1,234", 3))
    Assert.assertTrue(spreadsheetCheckerService.compare("1,23456", "1,23456", 3))
    Assert.assertTrue(spreadsheetCheckerService.compare("1,23456", "1,235", 3))
    Assert.assertFalse(spreadsheetCheckerService.compare("1,23456", "1,24", 4))
    Assert.assertFalse(spreadsheetCheckerService.compare("1,23456", "1,23", 4))
    Assert.assertFalse(spreadsheetCheckerService.compare("1,23456", "1,2345", 4))
  }

  @Test
  def mathCompareTest(): Unit = {
    Assert.assertTrue(spreadsheetCheckerService.compare("1+2+3", "3+2+1", 2))
    Assert.assertTrue(spreadsheetCheckerService.compare("2+a", "2+1a", 2))
    Assert.assertTrue(spreadsheetCheckerService.compare("abc", "a*b*c", 2))
    Assert.assertTrue(spreadsheetCheckerService.compare("a*2,51", "2,5*a", 1))
    Assert.assertFalse(spreadsheetCheckerService.compare("1+2+3", "3+2*1", 2))
    Assert.assertFalse(spreadsheetCheckerService.compare("2+a", "2+2a", 2))
    Assert.assertFalse(spreadsheetCheckerService.compare("abc", "a*b*d", 2))
    Assert.assertFalse(spreadsheetCheckerService.compare("a*2,56", "2,5*a", 1))
  }

  @Test
  def mathCheckTest(): Unit = {
    val fields = immutable.Seq(("a)", "7a-8b"), ("b)", "4,8b-0,3a"))
    val submittedCorrect = immutable.Map("a)" -> "7a-8b", "b)" -> "4,8b-0,3a").asJava
    val submittedWrong = immutable.Map("a)" -> "7a-8b", "b)" -> "4,8b-0,4a").asJava
    val submittedInvalid = immutable.Map("a)" -> "7a-#8b", "b)" -> "4,8b-0,3a").asJava
    val (status1, _) = spreadsheetCheckerService.check(fields, submittedCorrect, 2)
    Assert.assertEquals(2, status1)
    val (status2, _) = spreadsheetCheckerService.check(fields, submittedWrong, 2)
    Assert.assertEquals(1, status2)
    val (status3, _) = spreadsheetCheckerService.check(fields, submittedInvalid, 2)
    Assert.assertEquals(1, status3)
  }
}
