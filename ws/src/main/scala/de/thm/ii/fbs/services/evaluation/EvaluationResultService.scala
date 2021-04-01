package de.thm.ii.fbs.services.evaluation

import de.thm.ii.fbs.model.{CourseEvaluationResult, CourseResult,
  EvaluationContainer, EvaluationContainerResult, EvaluationContainerWithTaskResults, TaskResult}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import scala.math.BigDecimal.RoundingMode

/**
  * Evaluate Container results
  */
@Component
class EvaluationResultService {
  @Autowired
  private val formulaService: FormulaService = null

  /**
    * Evaluate Course results
    * @param container Evaluation Container
    * @param results the Course Results
    * @return Evaluation Course results for a User
    */
  def evaluate(container: List[EvaluationContainer], results: List[CourseResult]): List[CourseEvaluationResult] = {
    results.map(r => evaluateOne(container, r))
  }

  private def evaluateOne(container: List[EvaluationContainer], result: CourseResult): CourseEvaluationResult = {
    val taskResults = result.results.foldLeft(Map[Int, TaskResult]()) { (m, s) => m + (s.task.id -> s) }
    var passed = true
    var bonusPoints = 0

    val evaluationResult = container.map(c => {
      var passedTasks = 0
      val tasks = c.tasks.map(t => {
        val tRes = taskResults(t.id)
        if (tRes.passed) passedTasks += 1
        tRes
      })
      val cPassed = passedTasks >= c.toPass
      val bonusPointsVariables = Map("x" -> passedTasks.toString, "y" -> c.toPass.toString)

      // TODO to negative to round?
      val cBonusPoints =
        if (c.bonusFormula != null) formulaService.evaluate(c.bonusFormula, bonusPointsVariables).setScale(0, RoundingMode.HALF_UP).toInt else 0

      bonusPoints += cBonusPoints
      if (!cPassed) passed = false

      EvaluationContainerResult(cPassed, cBonusPoints, passedTasks, EvaluationContainerWithTaskResults(c.id, tasks, c.toPass, c.bonusFormula, c.hidePoints))
    })

    CourseEvaluationResult(result.user, passed, bonusPoints, evaluationResult)
  }
}
