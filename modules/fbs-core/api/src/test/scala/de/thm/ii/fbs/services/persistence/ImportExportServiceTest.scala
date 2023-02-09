package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.model.{Course, Task}
import de.thm.ii.fbs.services.`export`.{TaskExportService, TaskImportService}
import de.thm.ii.fbs.util.Archiver
import org.apache.commons.io.FileUtils
import org.junit.{Assert, Before, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

import java.io.File

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
class ImportExportServiceTest {
  @Autowired
  private val taskExportService: TaskExportService = null
  @Autowired
  private val taskImportService: TaskImportService = null
  @Autowired
  private val databaseMigrationService: DatabaseMigrationService = null
  @Autowired
  private val courseService: CourseService = null

  @Before
  def resetDatabase(): Unit = {
    databaseMigrationService.resetDatabase()
  }

  @Test
  def singleTask(): Unit = {
    courseService.create(Course("Test", "A Test"))
    val tasklist = List(new Task("Test", null, "", false))
    val (size, stream) = taskExportService.responseFromTaskId(tasklist)
    taskImportService.buildAllTasks(1, stream.getInputStream)
    //Assert.assertEquals()
  }
}
