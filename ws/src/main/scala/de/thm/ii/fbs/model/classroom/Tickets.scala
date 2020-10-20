package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.classroom.storage.ObjectStorage

import scala.collection.mutable

/**
  * Store for tickets.
  *
  * @author Andrej Sajenko
  */
class Tickets extends ObjectStorage[Ticket] {
  super.addIndex("id")
  super.addIndex("courseId")

  /**
    * Creates and stores an issue ticket
    * @param courseId The course id
    * @param desc The message
    * @param status The status of the ticket
    * @param creator The user who created the ticket
    * @param assignee The user who should handle the ticket
    * @param timestamp The creation of the ticket
    * @param priority The priority of the ticket
    * @return A ticket with a unique id
    */
  def create(courseId: Int, desc: String, status: String, creator: User, assignee: User, timestamp: Long, priority: Int): Ticket = {
    val id = ((System.currentTimeMillis << 20) | (System.nanoTime & ~9223372036854251520L)).toString
    if (super.getWhere("id", id).nonEmpty) {
      create(courseId, desc, status, creator, assignee, timestamp, priority)
    } else {
      val ticket = Ticket(courseId, desc, status, creator, assignee, timestamp, priority, id)
      addTicket(ticket)
      ticket
    }
  }

  /**
    * Overwrites an existing ticket with the same id
    * @param ticket Ticket
    */
  def update(ticket: Ticket): Unit = this.synchronized {
    val currentTicket = super.getWhere("id", ticket.id).head
    super.remove(currentTicket)
    super.add(ticket)

    onUpdateCb.foreach(_(ticket))
  }

  /**
    * Remove ticket by id
    * @param id The ticket id
    */
  def remove(id: String): Unit = this.synchronized {
    val currentTicket = super.getWhere("id", id).head
    super.remove(currentTicket)

    onRemoveCb.foreach(_(currentTicket))
  }

  /**
    * Get a ticket by id
    * @param id The id
    * @return The ticket
    */
  def getTicket(id: String): Option[Ticket] = super.getWhere("id", id).headOption

  /**
    * Get all tickets in course
    * @param courseId course id
    * @return The tickets in course
    */
  def get(courseId: Int): List[Ticket] = List.from(super.getWhere("courseId", courseId))

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

  private def addTicket(t: Ticket): Unit = {
    super.add(t)

    onCreateCb.foreach(_(t))
  }
}

/**
  * The companion object of Tickets
  */
object Tickets extends Tickets
