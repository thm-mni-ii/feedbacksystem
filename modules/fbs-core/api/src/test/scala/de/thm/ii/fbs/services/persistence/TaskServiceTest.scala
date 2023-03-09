package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.model.Task
import org.junit.runner.RunWith
import org.junit.{Assert, Before, Test}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
@ActiveProfiles(Array("test"))
class TaskServiceTest {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val databaseMigrationService: DatabaseMigrationService = null

  @Before
  def resetDatabase(): Unit = {
    databaseMigrationService.resetDatabase()
  }

  @Test
  def create(): Unit = {
    taskService.create(1, Task("Test", None, "type", isPrivate = false, "A Task", None, "optional", 1, 1, None))
    Assert.assertEquals(taskService.getAll(1).length, 1)
  }

  @Test
  def emptyAttemptsShouldBeNone(): Unit = {
    val task = Task("Test", None, "type", isPrivate = false, "A Task", None, "optional", 1, 1, None)
    taskService.create(1, task)
    Assert.assertEquals(taskService.getAll(1).head, task)
  }

  @Test
  def getZeroAttempts(): Unit = {
    val task = Task("Test", None, "type", isPrivate = false, "A Task", None, "optional", 1, 1, Option(0))
    taskService.create(1, task)
    Assert.assertEquals(taskService.getAll(1).head, task)
  }

  @Test
  def getCorrectAttempts(): Unit = {
    val task = Task("Test", None, "type", isPrivate = false, "A Task", None, "optional", 1, 1, Option(10))
    taskService.create(1, task)
    Assert.assertEquals(taskService.getAll(1).head, task)
  }

  @Test
  def update(): Unit = {
    create()
    taskService.update(1, 1, Task("Test", None, "type", isPrivate = false, "A Task", None, "mandatory", 1, 1, None))
    Assert.assertEquals(taskService.getAll(1).length, 1)
  }

  @Test
  def delete(): Unit = {
    create()
    taskService.delete(1, 1)
    Assert.assertEquals(taskService.getAll(1).length, 0)
  }
}
