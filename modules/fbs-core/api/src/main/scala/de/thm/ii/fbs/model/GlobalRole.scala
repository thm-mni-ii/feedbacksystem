package de.thm.ii.fbs.model

/**
  * The global roles of users
  */
object GlobalRole extends Enumeration {
  /**
    * Val shortcut
    */
  type GlobalRole = Value

  /**
    * Admin manages everything.
    */
  val ADMIN: GlobalRole = Value(0)
  /**
    * Moderator manages courses, docents and tutors.
    */
  val MODERATOR: GlobalRole = Value(1)
  /**
    * Usual user.
    */
  val USER: GlobalRole = Value(2)

  /**
    * Parse an int to a global role.
    * @param roleId The role id
    * @return Global role, where the id is mapped to its assigned enum type, if no enum type
    *         is assigned to the roleId provided, then the USER type is returned.
    */
  def parse(roleId: Int): GlobalRole = roleId match {
    case 0 => GlobalRole.ADMIN
    case 1 => GlobalRole.MODERATOR
    case _ => GlobalRole.USER
  }

  /**
    * Parse an int to a global role.
    * @param roleName The role name
    * @return Global role, where the name is mapped to its assigned enum type, if no enum type
    *         is assigned to the name provided, then the USER type is returned.
    */
  def parse(roleName: String): GlobalRole = roleName match {
    case "ADMIN" => GlobalRole.ADMIN
    case "MODERATOR" => GlobalRole.MODERATOR
    case _ => GlobalRole.USER
  }
}
