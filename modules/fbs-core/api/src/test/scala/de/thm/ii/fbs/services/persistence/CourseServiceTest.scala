package de.thm.ii.fbs.services.persistence;

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.model.Course
import org.junit.{Assert, Before, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
class CourseServiceTest {
    @Autowired
    private val courseService: CourseService = null
    @Autowired
    private val databaseMigrationService: DatabaseMigrationService = null

    @Before
    def resetDatabase(): Unit = {
        databaseMigrationService.resetDatabase()
    }

    @Test
    def create(): Unit = {
        courseService.create(Course("Test", "A Test"))
        Assert.assertEquals(courseService.getAll().length, 1);
    }

    @Test
    def update(): Unit = {
        create()
        courseService.update(1, Course("Test", "A Test", visible = false))
        Assert.assertEquals(courseService.getAll().length, 0);
    }

    @Test
    def delete(): Unit = {
        create()
        courseService.delete(1)
        Assert.assertEquals(courseService.getAll().length, 0);
    }
}
