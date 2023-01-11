package de.thm.ii.fbs.services.checker.math

import de.thm.ii.fbs.TestApplication
import org.junit.{Assert, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

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
  }
}
