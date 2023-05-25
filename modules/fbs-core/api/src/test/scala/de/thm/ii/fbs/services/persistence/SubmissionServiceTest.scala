package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.controller.exception.ForbiddenException
import de.thm.ii.fbs.model.{CheckResult, Submission, Task}
import org.joda.time.DateTime
import org.junit.runner.RunWith
import org.junit.{Assert, Before, Test}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
@ActiveProfiles(Array("test"))
class SubmissionServiceTest {
  @Autowired
  private val submissionService: SubmissionService = null
  @Autowired
  private val databaseMigrationService: DatabaseMigrationService = null
  @Autowired
  private val taskService: TaskService = null

  @Before
  def resetDatabase(): Unit = {
    databaseMigrationService.resetDatabase()
  }

  def createTask(attempts: Option[Int]): Task = {
    taskService.create(1, Task("Test", None, "type", isPrivate = false, "A Task", None, "optional", 1, 1, attempts))
  }

  @Test
  def create(): Unit = {
    val task = createTask(None)
    submissionService.create(1, task.id)
    Assert.assertEquals(submissionService.getAllByTask(1, 1).length, 1)
  }

  @Test
  def createWithAttempts(): Unit = {
    val task = createTask(Option(5))
    submissionService.create(1, task.id)
    Assert.assertEquals(submissionService.getAllByTask(1, 1).length, 1)
  }

  @Test
  def createUntilAttemptsLimit(): Unit = {
    val task = createTask(Option(2))
    for (_ <- 1 to 2) {
      submissionService.create(1, task.id)
    }
    Assert.assertEquals(submissionService.getAllByTask(1, 1).length, 2)
  }

  @Test(expected = classOf[ForbiddenException])
  def createAboveAttemptsLimit(): Unit = {
    val task = createTask(Option(2))
    for (_ <- 1 to 3) {
      submissionService.create(1, task.id)
    }
  }

  @Test(expected = classOf[ForbiddenException])
  def createWithZeroAttemptsLimit(): Unit = {
    val task = createTask(Option(0))
    submissionService.create(1, task.id)
  }

  @Test
  def testGetOrHiddenWithoutHidden(): Unit = {
    val task = createTask(None)
    val submission = Submission(DateTime.now().toDate, task.id, done = true, 0,
      results = List(CheckResult(1, "Test", "test", 1, null)).toArray,
      additionalInformation = None)
    val res = submissionService.getOrHidden(submission, hideResult = false, adminPrivileged = false)

    Assert.assertFalse(submission.isHidden)
    Assert.assertEquals(submission, res)
  }

  @Test
  def testGetOrHiddenWithHidden(): Unit = {
    val task = createTask(None)
    val submission = Submission(DateTime.now().toDate, task.id, done = true, 0,
      results = List(CheckResult(1, "Test", "test", 1, null)).toArray,
      additionalInformation = None)
    val res = submissionService.getOrHidden(submission, hideResult = true, adminPrivileged = false)

    Assert.assertTrue(res.isHidden)
    Assert.assertNotEquals(submission, res)
  }

  @Test
  def testGetOrHiddenWithHiddenAdmin(): Unit = {
    val task = createTask(None)
    val submission = Submission(DateTime.now().toDate, task.id, done = true, 0,
      results = List(CheckResult(1, "Test", "test", 1, null)).toArray,
      additionalInformation = None)
    val res = submissionService.getOrHidden(submission, hideResult = true, adminPrivileged = true)

    Assert.assertFalse(submission.isHidden)
    Assert.assertEquals(submission, res)
  }
}
