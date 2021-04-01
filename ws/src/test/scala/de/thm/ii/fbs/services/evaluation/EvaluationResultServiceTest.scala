package de.thm.ii.fbs.services.evaluation

import de.thm.ii.fbs.model.{CourseEvaluationResult, CourseResult,
  EvaluationContainer, EvaluationContainerResult, EvaluationContainerWithTaskResults, Task, TaskResult}
import org.junit.{Assert, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

/**
  * Tests EvaluationResultService
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[EvaluationResultService], classOf[FormulaService]))
class EvaluationResultServiceTest {
  @Autowired
  private val evaluationResultService: EvaluationResultService = null

  /**
    * Test evaluation without any Container
    */
  @Test
  def noContainerTest(): Unit = {
    val taskResult = TaskResult(Task("Test", "", "", "test", 1), 1, passed = true)
    val curseResult = CourseResult(null, passed = true, List(taskResult))
    val expectedRes = List(CourseEvaluationResult(null, passed = true, bonusPoints = 0, List.empty[EvaluationContainerResult]))

    val res = evaluationResultService.evaluate(List.empty[EvaluationContainer], results = List(curseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation without any Task
    */
  @Test
  def noTasksTest(): Unit = {
    val curseResult = CourseResult(null, passed = true, List.empty[TaskResult])
    val container = EvaluationContainer(1, List.empty, toPass = 0, bonusFormula = null, hidePoints = false)
    val expectedRes = List(CourseEvaluationResult(null, passed = true, bonusPoints = 0,
      List(EvaluationContainerResult(passed = true, 0, 0,
        EvaluationContainerWithTaskResults(container.id, List.empty[TaskResult], container.toPass, container.bonusFormula, container.hidePoints)))))

    val res = evaluationResultService.evaluate(List(container), results = List(curseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation without any Task and Container
    */
  @Test
  def noTasksAndContainerTest(): Unit = {
    val curseResult = CourseResult(null, passed = true, List.empty[TaskResult])
    val expectedRes = List(CourseEvaluationResult(null, passed = true, bonusPoints = 0, List.empty[EvaluationContainerResult]))

    val res = evaluationResultService.evaluate(List.empty[EvaluationContainer], results = List(curseResult))

    Assert.assertEquals(expectedRes, res)
  }
}
