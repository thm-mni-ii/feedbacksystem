package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.User

/**
  * An Conference System Invitation
  *
  * @param creator    creator of the invitation
  * @param visibility set of users who attend the conference
  * @param attendees  set of users who attend the conference
  * @param service    set of users who attend the conference
  * @param courseId   set of users who attend the conference
  */
abstract class Invitation(val creator: User, val courseId: Int, val visibility: String,
                          val attendees: scala.collection.mutable.Set[String], val service: String)
