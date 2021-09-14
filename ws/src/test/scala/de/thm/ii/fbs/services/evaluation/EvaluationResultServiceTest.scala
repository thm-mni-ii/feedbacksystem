package de.thm.ii.fbs.services.evaluation

import de.thm.ii.fbs.model.{EvaluationUserResult, CourseResult,
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
  *
  * TODO add more Test cases
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[EvaluationResultService], classOf[FormulaService]))
class EvaluationResultServiceTest {
  @Autowired
  private val evaluationResultService: EvaluationResultService = null

  private def buildTask(res: Boolean, id: Int = 1) = {
    val task = Task("", "", "", "", id)
    val taskResult = TaskResult(task, 2, passed = true)

    (task, taskResult)
  }

  private def buildContainer(tasks: List[Task] = List.empty[Task], bonusFormula: String = null, toPass: Int = 1, id: Int = 1) =
    EvaluationContainer(id, tasks, toPass, bonusFormula, hidePoints = true)
  private def buildCourseRes( passed: Boolean = true, tasksRes: List[TaskResult] = List.empty) =
    CourseResult(null, passed, tasksRes)

  /**
    * Test evaluation without any Container
    */
  @Test
  def noContainerTest(): Unit = {
    val (_, taskResult) = buildTask(res = true)
    val courseResult = buildCourseRes(tasksRes = List(taskResult))
    val expectedRes = List(EvaluationUserResult(null, passed = true, bonusPoints = 0, List.empty[EvaluationContainerResult]))

    val res = evaluationResultService.evaluate(List.empty[EvaluationContainer], results = List(courseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation without any Task
    */
  @Test
  def noTasksTest(): Unit = {
    val courseResult = buildCourseRes()
    val container = buildContainer(toPass = 0)
    val expectedRes = List(EvaluationUserResult(null, passed = true, bonusPoints = 0,
      List(EvaluationContainerResult(passed = true, 0, 0,
        EvaluationContainerWithTaskResults(container.id, List.empty[TaskResult], container.toPass, container.bonusFormula, container.hidePoints)))))

    val res = evaluationResultService.evaluate(List(container), results = List(courseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation without any Task and Container
    */
  @Test
  def noTasksAndContainerTest(): Unit = {
    val courseResult = buildCourseRes()
    val expectedRes = List(EvaluationUserResult(null, passed = true, bonusPoints = 0, List.empty[EvaluationContainerResult]))

    val res = evaluationResultService.evaluate(List.empty[EvaluationContainer], results = List(courseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation with a Container with on Task
    */
  @Test
  def containerWithOnTask(): Unit = {
    val (task, taskResult) = buildTask( res = true)
    val container = buildContainer(List(task))
    val courseResult = buildCourseRes(tasksRes = List(taskResult))

    val containerWithTaskRes =
      EvaluationContainerWithTaskResults(container.id, List(taskResult), container.toPass, container.bonusFormula, container.hidePoints)
    val containerRes = EvaluationContainerResult(passed = true, 0, 1, containerWithTaskRes)
    val expectedRes = List(EvaluationUserResult(null, passed = true, bonusPoints = 0, List(containerRes)))

    val res = evaluationResultService.evaluate(List(container), results = List(courseResult))

    Assert.assertEquals(expectedRes, res)
  }

  /**
    * Test evaluation with bonus formula
    */
  @Test
  def containerWithBonusFormula(): Unit = {
    val (task, taskResult) = buildTask(res = true)
    val container = buildContainer(List(task), "x + y")
    val courseResult = buildCourseRes(tasksRes = List(taskResult))

    val containerWithTaskRes =
      EvaluationContainerWithTaskResults(container.id, List(taskResult), container.toPass, container.bonusFormula, container.hidePoints)
    val containerRes = EvaluationContainerResult(passed = true, 2, 1, containerWithTaskRes)
    val expectedRes = List(EvaluationUserResult(null, passed = true, bonusPoints = 2, List(containerRes)))

    val res = evaluationResultService.evaluate(List(container), results = List(courseResult))

    Assert.assertEquals(expectedRes, res)
  }
}
