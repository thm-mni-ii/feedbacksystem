package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.User

/**
  * An Conference System Invitation
  *
  * @param href       JitsiConference Href for users to join the conference
  * @param creator    Issuer for the Invitation
  * @param courseId   courseId for the Invitation
  * @param service    service for the Invitation
  * @param visible visibility for the Invitation
  **/
case class JitsiInvitation(override val creator: User, override val courseId: Int, override val visible: Boolean, override val service: String,
                           href: String) extends Invitation(creator: User,
  courseId: Int,
  visible: Boolean,
  service: String)
