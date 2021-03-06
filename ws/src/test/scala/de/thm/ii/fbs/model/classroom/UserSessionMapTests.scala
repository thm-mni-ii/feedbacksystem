package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.{GlobalRole, User}
import org.junit.{Assert, Test}

/**
  * Tests the UserSessionMapTests
  */
class UserSessionMapTests {
  /**
    * Tests the map method
    */
  @Test
  def mapTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    Assert.assertEquals(1, userSessionMap.getAll.size)
  }

  /**
    * Tests the get method by Conference
    */
  @Test
  def getBySessionTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    val testUserOption = userSessionMap.get(sessionID)
    Assert.assertTrue(testUserOption.isDefined)
  }

  /**
    * Tests the get method by Principal
    */
  @Test
  def getByPrincipalTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    val testConferenceOption = userSessionMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isDefined)
    val testConferenceOptionEmpty = userSessionMap.get(exampleUser)
    Assert.assertTrue(testConferenceOptionEmpty.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deleteSessionTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    userSessionMap.delete(sessionID)
    val testConferenceOption = userSessionMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deletePrincipalTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    userSessionMap.delete(testUser)
    val testConferenceOption = userSessionMap.get(sessionID)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the onMap method
    */
  @Test
  def onMapTest(): Unit = {
    val userSessionMap = new UserSessionMap
    var run = false
    userSessionMap.onMap((Conference, principal) => {
      Assert.assertEquals(sessionID, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userSessionMap.map(sessionID, testUser)
    Assert.assertTrue(run)
  }

  /**
    * Tests the onDelete method
    */
  def onDeleteTest(): Unit = {
    val userSessionMap = new UserSessionMap
    var run = false
    userSessionMap.onDelete((Conference, principal) => {
      Assert.assertEquals(sessionID, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userSessionMap.map(sessionID, testUser)
    userSessionMap.delete(sessionID)
    Assert.assertTrue(run)
  }

  private val testUser = new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0)
  private val exampleUser = new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0)

  private val sessionID = "session"
}
