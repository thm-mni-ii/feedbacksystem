package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.{GlobalRole, User}
import org.junit.{Assert, Test}

import scala.collection.mutable

/**
  * Tests the UserConferenceMap
  */
class UserConferenceMapTest {
  /**
    * Tests the map method
    */
  @Test
  def mapTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    Assert.assertEquals(1, userConferenceMap.getAll.size)
  }

  /**
    * Tests the get method by Invitation
    */
  @Test
  def getByInvitationTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    val testUserOption = userConferenceMap.get(testInvitation)
    Assert.assertTrue(testUserOption.isDefined)
  }

  /**
    * Tests the get method by Principal
    */
  @Test
  def getByPrincipalTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    val testInvitationOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testInvitationOption.isDefined)
    val testInvitationOptionEmpty = userConferenceMap.get(exampleUser)
    Assert.assertTrue(testInvitationOptionEmpty.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deleteInvitationTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    userConferenceMap.delete(testInvitation)
    val testInvitationOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testInvitationOption.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deletePrincipalTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    userConferenceMap.delete(testUser)
    val testInvitationOption = userConferenceMap.get(testInvitation)
    Assert.assertTrue(testInvitationOption.isEmpty)
  }

  /**
    * Tests the onMap method
    */
  @Test
  def onMapTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onMap((invitation, principal) => {
      Assert.assertEquals(testInvitation, invitation)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testInvitation, testUser)
    Assert.assertTrue(run)
  }

  /**
    * Tests the onDelete method
    */
  def onDeleteTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onDelete((invitation, principal) => {
      Assert.assertEquals(testInvitation, invitation)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testInvitation, testUser)
    userConferenceMap.delete(testInvitation)
    Assert.assertTrue(run)
  }

  /**
    * Tests the exists method
    */
  def existsTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    val existingUser = userConferenceMap.exists(testUser)
    Assert.assertTrue(existingUser)
    val nonExistingUser = userConferenceMap.exists(exampleUser)
    Assert.assertTrue(nonExistingUser)
  }

  /**
    * Tests the getInvitation method
    */
  def getInvitationsTests(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testInvitation, testUser)
    val invitations = userConferenceMap.getInvitations(2)
    Assert.assertEquals(1, invitations.size)
  }

  private val testUser = new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0)
  private val testInvitation = BBBInvitation(testUser, 2, true, "bbb", "1234", "12345678", "87654321")
  private val exampleUser = new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0)
}
