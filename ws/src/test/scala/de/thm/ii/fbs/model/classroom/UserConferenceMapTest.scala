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
    userConferenceMap.map(testConference, testUser)
    Assert.assertEquals(1, userConferenceMap.getAll.size)
  }

  /**
    * Tests the get method by Conference
    */
  @Test
  def getByConferenceTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val testUserOption = userConferenceMap.get(testConference)
    Assert.assertFalse(testUserOption.isEmpty)
  }

  /**
    * Tests the get method by Principal
    */
  @Test
  def getByPrincipalTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val testConferenceOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isDefined)
    val testConferenceOptionEmpty = userConferenceMap.get(exampleUser)
    Assert.assertTrue(testConferenceOptionEmpty.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deleteConferenceTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testConference)
    val testConferenceOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deletePrincipalTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testUser)
    val testConferenceOption = userConferenceMap.get(testConference)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the onMap method
    */
  @Test
  def onMapTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onMap((Conference, principal) => {
      Assert.assertEquals(testConference, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testConference, testUser)
    Assert.assertTrue(run)
  }

  /**
    * Tests the onDelete method
    */
  def onDeleteTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onDelete((Conference, principal) => {
      Assert.assertEquals(testConference, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testConference)
    Assert.assertTrue(run)
  }

  /**
    * Tests the exists method
    */
  def existsTest(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val existingUser = userConferenceMap.exists(testUser)
    Assert.assertTrue(existingUser)
    val nonExistingUser = userConferenceMap.exists(exampleUser)
    Assert.assertTrue(nonExistingUser)
  }

  /**
    * Tests the getConference method
    */
  def getConferencesTests(): Unit = {
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val Conferences = userConferenceMap.getConferences(2)
    Assert.assertEquals(1, Conferences.size)
  }

  private val testUser = new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0)
  private val testConference = BBBConference(testUser, 2, true, "bbb", "1234", "12345678", "87654321")
  private val exampleUser = new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0)
}
