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
    * Tests the get method by Invitation
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
    val testInvitationOption = userSessionMap.get(testUser)
    Assert.assertTrue(testInvitationOption.isDefined)
    val testInvitationOptionEmpty = userSessionMap.get(exampleUser)
    Assert.assertTrue(testInvitationOptionEmpty.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deleteSessionTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    userSessionMap.delete(sessionID)
    val testInvitationOption = userSessionMap.get(testUser)
    Assert.assertTrue(testInvitationOption.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deletePrincipalTest(): Unit = {
    val userSessionMap = new UserSessionMap
    userSessionMap.map(sessionID, testUser)
    userSessionMap.delete(testUser)
    val testInvitationOption = userSessionMap.get(sessionID)
    Assert.assertTrue(testInvitationOption.isEmpty)
  }

  /**
    * Tests the onMap method
    */
  @Test
  def onMapTest(): Unit = {
    val userSessionMap = new UserSessionMap
    var run = false
    userSessionMap.onMap((invitation, principal) => {
      Assert.assertEquals(sessionID, invitation)
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
    userSessionMap.onDelete((invitation, principal) => {
      Assert.assertEquals(sessionID, invitation)
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
