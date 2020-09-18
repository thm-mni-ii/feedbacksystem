package de.thm.ii.fbs.model

import java.security.Principal
import scala.collection.mutable

/**
  * Maps session ids to principals.
  *
  * @author Andrej Sajenko
  */
object UserSessionMap {
  private val sessionToUser = mutable.Map[String, Principal]()
  private val userToSession = mutable.Map[Principal, String]()

  /**
    * Maps a user to its session
    * @param id session id
    * @param p principal
    */
  def map(id: String, p: Principal): Unit = {
    if (userToSession.contains(p)) {
      sessionToUser.remove(userToSession(p))
      userToSession.remove(p)
    }

    sessionToUser.put(id, p)
    userToSession.put(p, id)
    onMapListeners.foreach(_(id, p))
  }

  /**
    * @param id The session id
    * @return The principal for the given session id
    */
  def get(id: String): Option[Principal] = sessionToUser.get(id)

  /**
    * @param p The principal
    * @return The session id for the given principal
    */
  def get(p: Principal): Option[String] = userToSession.get(p)

  /**
    * Removes both, the user and its session by using its session id
    * @param id Session id
    */
  def delete(id: String): Unit = {
    sessionToUser.remove(id).foreach(p => {
      userToSession.remove(p)
      onDeleteListeners.foreach(_(id, p))
    })
  }

  /**
    * Removes both, the user and its session by using its principal
    * @param p The principal
    */
  def delete(p: Principal): Unit = {
    userToSession.remove(p).foreach(id => {
      sessionToUser.remove(id)
      onDeleteListeners.foreach(_(id, p))
    })
  }

  private val onMapListeners = mutable.Set[(String, Principal) => Unit]()
  private val onDeleteListeners = mutable.Set[(String, Principal) => Unit]()

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
