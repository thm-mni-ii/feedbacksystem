package de.thm.ii.fbs.services.labels

/**
  * Class holds all DB labels
  */
object RoleDBLabels {
  /** DB Label "role_id" */
  var role_id: String = "role_id"
  /** DB Label "role_name" */
  var role_name: String = "role_name"
  /** DB Label "role_description" */
  var role_description: String = "role_description"
  /** ROLE LABEL "MODERATOR" */
  var MODERATOR: String = "MODERATOR"
  /** ROLE LABEL "ADMIN" */
  var ADMIN: String = "ADMIN"
  /** ROLE LABEL "DOCENT" */
  var DOCENT: String = "DOCENT"
  /** ROLE LABEL "TUTOR" */
  var TUTOR: String = "TUTOR"
  /** ROLE LABEL "ADMIN" */
  var STUDENT: String = "STUDENT"
  /** ROLE ID "ADMIN" */
  val ADMIN_ROLE_ID = 1
  /** ROLE ID "DOCENT" */
  val DOCENT_ROLE_ID = 4
  /** ROLE ID "STUDENT" */
  val TUTOR_ROLE_ID = 8
  /** ROLE ID "STUDENT" */
  val USER_ROLE_ID = 16
}
