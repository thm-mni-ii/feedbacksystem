package de.thm.ii.fbs.model

import java.util.Objects

import scala.collection.mutable

/**
  * Store for tickets.
  *
  * @author Andrej Sajenko
  */
object Tickets {
  private val courseToTickets = mutable.Map[Int, mutable.Set[Ticket]]()
  private val ticketToCourse = mutable.Map[String, Int]()
  private val idToTicket = mutable.Map[String, Ticket]()

  /**
    * Creates and stores an issue ticket
    * @param courseId The course id
    * @param title Title of a ticket
    * @param desc The message
    * @param status The status of the ticket
    * @param creator The user who created the ticket
    * @param assignee The user who should handle the ticket
    * @param timestamp The creation of the ticket
    * @param priority The priority of the ticket
    * @return A ticket with a unique id
    */
  def create(courseId: Int, title: String, desc: String, status: String, creator: User, assignee: User, timestamp: Long, priority: Int): Ticket = {
    val id = ((System.currentTimeMillis << 20) | (System.nanoTime & ~9223372036854251520L)).toString()
    if (ticketToCourse.contains(id)) {
      create(courseId, title, desc, status, creator, assignee, timestamp, priority)
    } else {
      val ticket = Ticket(courseId, title, desc, status, creator, assignee, timestamp, priority, id)
      add(ticket)
      ticket
    }
  }

  /**
    * Overwrites an existing ticket with the same id
    * @param ticket Ticket
    */
  def update(ticket: Ticket): Unit = {
    courseToTickets.get(ticket.courseId).foreach(_.remove(ticket))
    courseToTickets.get(ticket.courseId).foreach(_.add(ticket))
    idToTicket.put(ticket.id, ticket)

    onUpdateCb.foreach(_(ticket))
  }

  /**
    * Remove ticket by id
    * @param id The ticket id
    */
  def remove(id: String): Unit = idToTicket.get(id).foreach(remove)

  /**
    * Remove ticket
    * @param t The id
    */
  def remove(t: Ticket): Unit = {
    ticketToCourse.remove(t.id)
      .flatMap(courseToTickets.get)
      .foreach(_.remove(t))
    idToTicket.remove(t.id)

    onRemoveCb.foreach(_(t))
  }

  /**
    * Get a ticket by id
    * @param id The id
    * @return The ticket
    */
  def getTicket(id: String): Option[Ticket] = idToTicket.get(id)

  /**
    * Get all tickets in course
    * @param courseId course id
    * @return The tickets in course
    */
  def get(courseId: Int): List[Ticket] = courseToTickets.getOrElse(courseId, mutable.Set()).toList

  private val onCreateCb = mutable.Set[(Ticket) => Unit]()
  private val onUpdateCb = mutable.Set[(Ticket) => Unit]()
  private val onRemoveCb = mutable.Set[(Ticket) => Unit]()

  /**
    * @param cb Called on ticket update.
    */
  def onUpdate(cb: (Ticket) => Unit): Unit = onUpdateCb.add(cb)
  /**
    * @param cb Called on ticket creation.
    */
  def onCreate(cb: (Ticket) => Unit): Unit = onCreateCb.add(cb)
  /**
    * @param cb Called on ticket removal.
    */
  def onRemove(cb: (Ticket) => Unit): Unit = onRemoveCb.add(cb)

  private def add(t: Ticket): Unit = {
    courseToTickets.getOrElseUpdate(t.courseId, mutable.Set.empty).add(t)
    ticketToCourse.put(t.id, t.courseId)
    idToTicket.put(t.id, t)

    onCreateCb.foreach(_(t))
  }
}

/**
  * An issue ticket
  * @param courseId The course id
  * @param title Title of a ticket
  * @param desc The message
  * @param status The ticket status
  * @param creator The user who created the ticket
  * @param assignee The user to that the ticket is assigned to
  * @param timestamp The timestamp of the creation
  * @param priority The priority of the issue ticket
  * @param id the unique ticket id
  * @param queuePosition the unique ticket id
  */
case class Ticket(courseId: Int, title: String, desc: String, status: String, creator: User,
                  assignee: User, timestamp: Long, priority: Int, id: String = "0", var queuePosition: Int = 0) {
  /**
    * @return The hash code -- using id
    */
  override def hashCode(): Int = Objects.hash(id)

  /**
    * @param other The other object
    * @return True if id is the same
    */
  override def equals(other: Any): Boolean = other match {
    case that: Ticket => that.canEqual(this) && this.id == that.id
    case _ => false
  }
}
