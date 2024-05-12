package de.thm.ii.fbs.model

/**
  * A group
  * @param id The id of the group
  * @param courseId course to which the group belongs
  * @param name Name of the group
  * @param membership The max number of members
  * @param visible The visibility of the group, false = invisible
  */

case class Group(id: Int, courseId: Int, name: String, membership: Int, visible: Boolean = true)
