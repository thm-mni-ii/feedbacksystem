package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.User

/**
  * An Conference System Invitation
  *
  * @param meetingId         meetingId for users to generate their own invitation link
  * @param meetingPassword   meetingPassword for users to generate their own invitation link
  * @param moderatorPassword meetingPassword for users to generate their own invitation link with moderator rights
  * @param creator           Issuer for the Invitation
  * @param courseId          courseId for the Invitation
  * @param service           conference system used
  * @param visible           defines if conference is publicly visible in the classroom
  */
case class BBBInvitation(override val creator: User, override val courseId: Int, override val visible: Boolean,
                         override val service: String, meetingId: String, meetingPassword: String,
                         moderatorPassword: String) extends Invitation(creator: User,
  courseId: Int,
  visible: Boolean,
  service: String
)
