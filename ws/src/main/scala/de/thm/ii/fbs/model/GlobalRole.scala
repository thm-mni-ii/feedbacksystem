package de.thm.ii.fbs.model

/**
  * The global roles of users
  */
object GlobalRole extends Enumeration {
  /**
    * Admin manages everything.
    */
  val ADMIN = Value(0)
  /**
    * Moderator manages courses, docents and tutors.
    */
  val MODERATOR = Value(1)
  /**
    * Usual user.
    */
  val USER = Value(2)
}
