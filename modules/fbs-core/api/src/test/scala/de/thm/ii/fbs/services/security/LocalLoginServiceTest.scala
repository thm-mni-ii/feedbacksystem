package de.thm.ii.fbs.services.persistence;

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.model.{Course, GlobalRole, User}
import de.thm.ii.fbs.services.security.LocalLoginService
import de.thm.ii.fbs.util.Hash
import org.junit.{Assert, Before, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit4.SpringRunner

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
class LocalLoginServiceTest {
  @Autowired
  private val userService: UserService = null
  @Autowired
  private val localLoginService: LocalLoginService = null
  @Autowired
  private val databaseMigrationService: DatabaseMigrationService = null

  @Before
  def resetDatabase(): Unit = {
    databaseMigrationService.resetDatabase()
  }

  private val exampleUser = new User("Test", "Tester", "test@example.ork", "test", GlobalRole.USER)
  private val outdatedPasswordHash = Hash.hash("test")
  private def passwordHash = localLoginService.hash("test")

  private def createTestUserWithOutdatedPasswordHash() = userService.create(
    exampleUser,
    outdatedPasswordHash
  )

  private def createTestUser() = userService.create(
    exampleUser,
    passwordHash
  )

  @Test
  def failedMigrationTest(): Unit = {
    createTestUserWithOutdatedPasswordHash()
    val user = localLoginService.login("test", "1234")
    Assert.assertEquals(None, user)
    val password = userService.getPassword("test")
    Assert.assertEquals(Some(outdatedPasswordHash), password)
  }

  @Test
  def successfulMigrationTest(): Unit = {
    createTestUserWithOutdatedPasswordHash()
    val user = localLoginService.login("test", "test")
    Assert.assertEquals(Some(exampleUser), user)
    val password = userService.getPassword("test")
    Assert.assertNotEquals(Some(outdatedPasswordHash), password)
  }

  @Test
  def failedLoginTest(): Unit = {
    createTestUser()
    val user = localLoginService.login("test", "1234")
    Assert.assertEquals(None, user)
  }

  @Test
  def failedLoginTestWrongUsername(): Unit = {
    createTestUser()
    val user = localLoginService.login("1234", "test")
    Assert.assertEquals(None, user)
  }

  @Test
  def loginTest(): Unit = {
    createTestUser()
    val user = localLoginService.login("test", "test")
    Assert.assertEquals(Some(exampleUser), user)
  }

  @Test
  def createUserTest(): Unit = {
    createTestUser()
    val user = localLoginService.createUser(exampleUser, "test")
    Assert.assertNotNull(user)
    val loginUser = localLoginService.login("test", "test")
    Assert.assertEquals(Some(exampleUser), loginUser)
  }
}
