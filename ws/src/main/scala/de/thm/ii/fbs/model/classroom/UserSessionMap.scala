package de.thm.ii.fbs.model.classroom

import java.security.Principal

import de.thm.ii.fbs.model.classroom.storage.{BidirectionalStorage, NonDuplicatesBidirectionalStorage}

import scala.collection.mutable

/**
  * Maps session ids to principals.
  */
class UserSessionMap extends NonDuplicatesBidirectionalStorage[String, Principal] {
  private val onMapListeners = mutable.Set[(String, Principal) => Unit]()
  private val onDeleteListeners = mutable.Set[(String, Principal) => Unit]()

  /**
    * Maps a user to its session
    *
    * @param id session id
    * @param p  principal
    */
  def map(id: String, p: Principal): Unit = {
    super.put(id, p)
    onMapListeners.foreach(_ (id, p))
  }

  /**
    * @param id The session id
    * @return The principal for the given session id
    */
  def get(id: String): Option[Principal] = super.getSingleB(id)

  /**
    * @param p The principal
    * @return The session id for the given principal
    */
  def get(p: Principal): Option[String] = super.getSingleA(p)

  /**
    * Removes both, the user and its session by using its session id
    *
    * @param id Session id
    */
  def delete(id: String): Unit = {
    super.deleteByA(id).foreach(p => {
      onDeleteListeners.foreach(_ (id, p))
    })
  }

  /**
    * Removes both, the user and its session by using its principal
    *
    * @param p The principal
    */
  def delete(p: Principal): Unit = {
    super.deleteByB(p).foreach(id => {
      onDeleteListeners.foreach(_ (id, p))
    })
  }

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onMap(cb: (String, Principal) => Unit): Unit = {
    onMapListeners.add(cb)
  }

  /**
    * @param cb Callback that gets executed on every map event
    */
  def onDelete(cb: (String, Principal) => Unit): Unit = {
    onDeleteListeners.add(cb)
  }
}

/**
  * The companion object of UserConferenceMap
  */
object UserSessionMap extends UserSessionMap
