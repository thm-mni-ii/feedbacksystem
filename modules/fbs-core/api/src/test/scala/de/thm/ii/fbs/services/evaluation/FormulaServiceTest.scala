package de.thm.ii.fbs.services.evaluation

import org.junit.runner.RunWith
import org.junit.{Assert, Test}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.{ActiveProfiles, ContextConfiguration}
import org.springframework.test.context.junit4.SpringRunner

/**
  * Tests FormulaService
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[FormulaService]))
@ActiveProfiles(Array("test"))
class FormulaServiceTest {
  @Autowired
  private val formulaService: FormulaService = null

  private def validateFormula(formula: String, shouldBeInvalid: Boolean = false): Unit = {
    val valid = formulaService.validate(formula)
    if (shouldBeInvalid) {
      Assert.assertFalse(s"Formula $formula should be invalid: ${valid.msg}", valid.result)
    } else {
      Assert.assertTrue(s"Formula $formula should be valid: ${valid.msg}", valid.result)
    }
  }

  private def evalFormula(formula: String, excepted: BigDecimal, variables: Map[String, String] = Map.empty): Unit = {
    val res = if (variables.isEmpty) formulaService.evaluate(formula) else formulaService.evaluate(formula, variables)
    val withMsg = if (variables.nonEmpty) s"(with ${variables.mkString(", ")})" else ""
    Assert.assertEquals(s"$formula $withMsg should be evaluated to $excepted \n", excepted, res)
  }

  /**
    * "SQR(3) + 2" should be an invalid formula
    */
  @Test
  def validateInvalidFunctionTest(): Unit = {
    validateFormula("SQR(3) + 2", shouldBeInvalid = true)
  }

  /**
    * "(10 + 2" should be an invalid formula
    */
  @Test
  def validateInvalidPrancesTest(): Unit = {
    validateFormula("(10 + 2", shouldBeInvalid = true)
  }

  /**
    * "1 + 5 * 7 - 2 / 10" should be an valid formula
    */
  @Test
  def validateSimpleFormulaTest(): Unit = {
    validateFormula("1 + 5 * 7 - 2 / 10")
  }

  /**
    * "a - b / 2" should be an valid formula
    */
  @Test
  def validateWithVariableTest(): Unit = {
    validateFormula("a - b / 2")
  }

  /**
    * "ROUND(COS(a) * 10 + 20 + FLOOR(10) / 20 - h + ABS(h - 6 + 5), 2)" should be an valid formula
    */
  @Test
  def validateBigTest(): Unit = {
    validateFormula("ROUND(COS(a) * 10 + 20 + FLOOR(10) / 20 - h + ABS(h - 6 + 5), 2)")
  }

  /**
    * "1 + 5 * 7 - 2 / 10" should be 35.8
    */
  @Test
  def evalSimpleTest(): Unit = {
    evalFormula("1 + 5 * 7 - 2 / 10", BigDecimal("35.8"))
  }

  /**
    * "((((1 + 5) * 7) - 2)) / (10)" should be 4
    */
  @Test
  def evalParenthesesTest(): Unit = {
    evalFormula("((((1 + 5) * 7) - 2)) / (10)", BigDecimal("4"))
  }

  /**
    * "ROUND(11/2, 0)" should be 6
    */
  @Test
  def evalFunctionTest(): Unit = {
    evalFormula("ROUND(11/2, 0)", BigDecimal("6"))
  }

  /**
    * "a - b / 2" (with a -> 10, b -> 20) should be 0
    */
  @Test
  def evalVariableTest(): Unit = {
    evalFormula("a - b / 2", BigDecimal("0"), Map("a" -> "10", "b" -> "20"))
  }

  /**
    * "ROUND(COS(a) * 10 + 20 + FLOOR(10) / 20 - h + ABS(h - 6 + 5), 2)" should be 29.46
    */
  @Test
  def evalBigTest(): Unit = {
    evalFormula("ROUND(COS(a) * 10 + 20 + FLOOR(10) / 20 - h + ABS(h - 6 + 5), 2)", BigDecimal("29.46"), Map("a" -> "5", "h" -> "10"))
  }
}
