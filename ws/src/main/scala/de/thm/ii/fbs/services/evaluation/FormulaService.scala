package de.thm.ii.fbs.services.evaluation

import com.udojava.evalex.Expression
import com.udojava.evalex.Expression.ExpressionException
import de.thm.ii.fbs.model.ValidateFormula
import org.springframework.stereotype.Component

/**
  * Handle evaluation formula
  */
@Component
class FormulaService {
  /**
    * Validate a formula.
    *
    * @param formula them formula to validate
    * @return is the formula valid
    */
  def validate(formula: String): ValidateFormula = {
    try {
      new Expression(formula).toRPN
      new ValidateFormula(true, "Formula is valid")
    } catch {
      case e: ExpressionException =>
        new ValidateFormula(false, e.getMessage)
      case _: Exception =>
        new ValidateFormula(false, "Formula is invalid")
    }
  }

  /**
    * Evaluate a formula
    *
    * @param formula   the formula to evaluate
    * @param variables variables that should be replaced
    * @return the result of the formula
    * @throws ExpressionException if the formula is invalid
    */
  def evaluate(formula: String, variables: Map[String, String] = Map.empty): BigDecimal = {
    val expr = new Expression(formula)

    variables.foreach(v => expr.setVariable(v._1, v._2))
    expr.eval()
  }
}
