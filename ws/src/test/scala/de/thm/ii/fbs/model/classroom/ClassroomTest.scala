package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.{CourseRole, GlobalRole, Participant, User}
import org.junit.{Assert, Test}

/**
  * Tests the Classroom model
  */
class ClassroomTest {
  /**
    * Tests the join method
    */
  @Test
  def joinTest(): Unit = {
    val classroom = new Classroom
    classroom.join(0, testParticipant)
    classroom.join(0, exampleParticipant)
    Assert.assertEquals(2, classroom.getAll.size)
  }

  /**
    * Tests the leave method
    */
  @Test
  def leaveTest(): Unit = {
    val classroom = new Classroom
    classroom.join(0, testParticipant)
    classroom.leave(testParticipant)
    Assert.assertEquals(0, classroom.getAll.size)
  }

  /**
    * Tests the get method
    */
  @Test
  def getTest(): Unit = {
    val classroom = new Classroom
    classroom.join(2, exampleParticipant)
    val emptyOption = classroom.get(testParticipant)
    Assert.assertTrue(emptyOption.isEmpty)
    val definedOptions = classroom.get(exampleParticipant)
    Assert.assertTrue(definedOptions.isDefined)
    Assert.assertEquals(2, definedOptions.get)
  }

  /**
    * Tests the getParticipants method
    */
  @Test
  def getParticipantsTest(): Unit = {
    val classroom = new Classroom
    classroom.join(2, testParticipant)
    classroom.join(2, exampleParticipant)
    val participants = classroom.getParticipants(2)
    Assert.assertEquals(2, participants.size)
  }

  private val testParticipant = Participant(new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0), CourseRole.STUDENT)
  private val exampleParticipant = Participant(new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0), CourseRole.STUDENT)
}
