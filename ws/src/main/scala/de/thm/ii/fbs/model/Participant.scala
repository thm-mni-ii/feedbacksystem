package de.thm.ii.fbs.model

/**
  * Course participant
  * @param user The participant
  * @param role The participants role in the course
  *
  * @author Andrej Sajenko
  */
case class Participant(user: User, role: CourseRole.Value)
