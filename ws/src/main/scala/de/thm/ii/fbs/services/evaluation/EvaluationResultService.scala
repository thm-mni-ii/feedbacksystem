package de.thm.ii.fbs.services.evaluation

import de.thm.ii.fbs.model.{EvaluationUserResult, CourseResult, EvaluationContainer,
  EvaluationContainerResult, EvaluationContainerWithTaskResults, Task, TaskResult}
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
  def evaluate(container: List[EvaluationContainer], results: List[CourseResult]): List[EvaluationUserResult] = {
    results.map(r => evaluateOne(container, r))
  }

  private def evaluateOne(container: List[EvaluationContainer], result: CourseResult): EvaluationUserResult = {
    val taskResults = result.results.foldLeft(Map[Int, TaskResult]()) { (m, s) => m + (s.task.id -> s) }
    var passed = true
    var bonusPoints = 0

    val evaluationResult = container.map(c => {
      val (passedTasks, tasksResults) = getTaskResults(c.tasks, taskResults)
      val cPassed = wasPassed(passedTasks, c.toPass)
      val cBonusPoints = calculateBonusPoints(c.bonusFormula, passedTasks, c.toPass)

      bonusPoints += cBonusPoints
      if (!cPassed) passed = false

      EvaluationContainerResult(cPassed, cBonusPoints, passedTasks,
        EvaluationContainerWithTaskResults(c.id, tasksResults, c.toPass, c.bonusFormula, c.hidePoints))
    })

    EvaluationUserResult(result.user, passed, bonusPoints, evaluationResult)
  }

  private def getTaskResults(tasks: List[Task], taskResults: Map[Int, TaskResult]) = {
    var passedTasks = 0
    val tasksResults = tasks.map(t => {
      val tRes = taskResults(t.id)
      if (tRes.passed) passedTasks += 1
      tRes
    })

    (passedTasks, tasksResults)
  }

  private def wasPassed(passedTasks: Int, toPass: Int) = passedTasks >= toPass

  private def calculateBonusPoints(bonusFormula: String, passedTasks: Int, toPass: Int) = {
    val bonusPointsVariables = Map("x" -> passedTasks.toString, "y" -> toPass.toString)

    val bonusPoints = try {
      if (bonusFormula != null) formulaService.evaluate(bonusFormula, bonusPointsVariables).setScale(0, RoundingMode.HALF_UP).toInt else 0
    } catch {
      // If the bonus formula is invalid, the entire calculation should not fail
      case _: Exception => 0
    }

    // Convert negative numbers to zero
    if (bonusPoints >= 0) bonusPoints else 0
  }
}
