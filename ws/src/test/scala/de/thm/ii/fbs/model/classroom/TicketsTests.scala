package de.thm.ii.fbs.model.classroom

import java.time.Instant

import de.thm.ii.fbs.model.{GlobalRole, User}
import org.junit.{Assert, Test}

/**
  * Tests the TicketsTests
  */
class TicketsTests {
  /**
    * Tests the create method
    */
  @Test
  def createTest(): Unit = {
    val tickets = new Tickets()
    this.createIssue(tickets)
    val allTickets = tickets.getAll
    Assert.assertEquals(1, allTickets.size)
  }

  /**
    * Tests the update method
    */
  @Test
  def updateTest(): Unit = {
    val tickets = new Tickets()
    val ticket = this.createIssue(tickets)
    ticket.queuePosition = 10
    tickets.update(ticket)
    val gotTicket = tickets.getTicket(ticket.id)
    Assert.assertEquals(10, gotTicket.head.queuePosition)
  }

  /**
    * Tests the remove method
    */
  @Test
  def removeTest(): Unit = {
    val tickets = new Tickets()
    val ticket = this.createIssue(tickets)
    tickets.remove(ticket.id)
    val ticketOption = tickets.getTicket(ticket.id)
    Assert.assertTrue(ticketOption.isEmpty)
  }

  /**
    * Tests the get method by id
    */
  @Test
  def getTicketTest(): Unit = {
    val tickets = new Tickets()
    val ticket = this.createIssue(tickets)
    val ticketOption = tickets.getTicket(ticket.id)
    Assert.assertTrue(ticketOption.isDefined)
    val ticketOptionEmpty = tickets.getTicket("non-existing")
    Assert.assertTrue(ticketOptionEmpty.isEmpty)
  }

  /**
    * Tests the get method by course id
    */
  @Test
  def getTest(): Unit = {
    val tickets = new Tickets()
    this.createIssue(tickets)
    this.createAnotherIssue(tickets)
    val ticketsInCourse = tickets.get(2)
    Assert.assertEquals(2, ticketsInCourse.size)
  }

  /**
    * Tests the onUpdate method
    */
  @Test
  def onUpdateTest(): Unit = {
    val tickets = new Tickets()
    val ticket = this.createIssue(tickets)
    var called = false
    tickets.onUpdate(updatedTicket => {
      Assert.assertEquals(ticket.id, updatedTicket.id)
      Assert.assertEquals(10, updatedTicket.queuePosition)
      Assert.assertEquals("An Issue", ticket.title)
      called = true
    })
    ticket.queuePosition = 10
    tickets.update(ticket)
    Assert.assertTrue(called)
  }
  /**
    * Tests the onCreate method
    */
  @Test
  def onCreateTest(): Unit = {
    val tickets = new Tickets()
    var called = false
    tickets.onCreate(ticket => {
      Assert.assertEquals("An Issue", ticket.title)
      called = true
    })
    this.createIssue(tickets)
    Assert.assertTrue(called)
  }
  /**
    * Tests the onRemove method
    */
  @Test
  def onRemoveTest(): Unit = {
    val tickets = new Tickets()
    val ticket = this.createIssue(tickets)
    var called = false
    tickets.onRemove(removedTicket => {
      Assert.assertEquals(ticket.id, removedTicket.id)
      Assert.assertEquals("An Issue", ticket.title)
      called = true
    })
    tickets.remove(ticket.id)
    Assert.assertTrue(called)
  }

  private val testUser = new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0)
  private val exampleUser = new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0)

  private def createIssue(tickets: Tickets) = tickets.create(2, "An Issue",
    "I have an issue", "open", testUser, exampleUser, Instant.now().getEpochSecond, 1)
  private def createAnotherIssue(tickets: Tickets) = tickets.create(2, "Another Issue",
    "I  also have an issue", "open", exampleUser, exampleUser, Instant.now().getEpochSecond, 1)
}
