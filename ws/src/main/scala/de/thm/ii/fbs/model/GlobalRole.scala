package de.thm.ii.fbs.model

/**
  * The global roles of users
  */
object GlobalRole extends Enumeration {
  /**
    * Admin manages everything.
    */
  val ADMIN: GlobalRole.Value = Value(0)
  /**
    * Moderator manages courses, docents and tutors.
    */
  val MODERATOR: GlobalRole.Value = Value(1)
  /**
    * Usual user.
    */
  val USER: GlobalRole.Value = Value(2)

  /**
    * Parse an int to a global role.
    * @param roleId The role id
    * @return Global role, where the id is mapped to its assigned enum type, if no enum type
    *         is assigned to the roleId provided, then the USER type is returned.
    */
  def parse(roleId: Int): GlobalRole.Value = roleId match {
    case 0 => GlobalRole.ADMIN
    case 1 => GlobalRole.MODERATOR
    case _ => GlobalRole.USER
  }
}
