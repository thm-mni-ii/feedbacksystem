package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.User

/**
  * An Conference System Invitation
  *
  * @param href       JitsiConference Href for users to join the conference
  * @param creator    Issuer for the Invitation
  * @param courseId   courseId for the Invitation
  * @param service    courseId for the Invitation
  * @param visibility courseId for the Invitation
  * @param attendees  courseId for the Invitation
  **/
case class JitsiInvitation(override val creator: User, override val courseId: Int, override val visibility: String,
                           override val attendees: scala.collection.mutable.Set[String], override val service: String,
                           href: String) extends Invitation(creator: User,
  courseId: Int,
  visibility: String,
  attendees: scala.collection.mutable.Set[String],
  service: String)
