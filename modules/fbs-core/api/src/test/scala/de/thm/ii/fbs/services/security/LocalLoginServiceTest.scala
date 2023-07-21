package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.TestApplication
import de.thm.ii.fbs.model.v2.security.authorization.GlobalRole
import de.thm.ii.fbs.model.Course
import de.thm.ii.fbs.model.v2.security.authentication.User
import de.thm.ii.fbs.services.security.LocalLoginService
import de.thm.ii.fbs.services.v2.security.authentication.UserService
import de.thm.ii.fbs.util.Hash
import org.junit.{Assert, Before, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
@ActiveProfiles(Array("test"))
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

  private val exampleUsername = "test"
  private val examplePassword = "test"
  private val exampleUser = new User("Test", "Tester", exampleUsername, GlobalRole.USER, "test@example.ork", null, null, false, false, null)
  private val outdatedPasswordHash = Hash.hash(examplePassword)
  private def passwordHash = localLoginService.hash(examplePassword)

  private def createTestUserWithOutdatedPasswordHash() = {
    exampleUser.setPassword(outdatedPasswordHash)
    userService.create(exampleUser)
  }

  private def createTestUser() = {
    exampleUser.setPassword(passwordHash)
    userService.create(exampleUser)
  }

  @Test
  def failedMigrationTest(): Unit = {
    createTestUserWithOutdatedPasswordHash()
    val user = localLoginService.login(exampleUsername, "1234")
    Assert.assertEquals(None, user)
    val password = Option(userService.getPassword(exampleUsername))
    Assert.assertEquals(Some(outdatedPasswordHash), password)
  }

  @Test
  def successfulMigrationTest(): Unit = {
    createTestUserWithOutdatedPasswordHash()
    val user = localLoginService.login(exampleUsername, examplePassword)
    Assert.assertEquals(Some(exampleUser), user)
    val password = Option(userService.getPassword(exampleUsername))
    Assert.assertNotEquals(Some(outdatedPasswordHash), password)
  }

  @Test
  def failedLoginTest(): Unit = {
    createTestUser()
    val user = localLoginService.login(exampleUsername, "1234")
    Assert.assertEquals(None, user)
  }

  @Test
  def failedLoginTestWrongUsername(): Unit = {
    createTestUser()
    val user = localLoginService.login("1234", examplePassword)
    Assert.assertEquals(None, user)
  }

  @Test
  def loginTest(): Unit = {
    createTestUser()
    val user = localLoginService.login(exampleUsername, examplePassword)
    Assert.assertEquals(Some(exampleUser), user)
  }

  @Test
  def createUserTest(): Unit = {
    createTestUser()
    val user = localLoginService.createUser(exampleUser, examplePassword)
    Assert.assertNotNull(user)
    val loginUser = localLoginService.login(exampleUsername, examplePassword)
    Assert.assertEquals(Some(exampleUser), loginUser)
  }
}
