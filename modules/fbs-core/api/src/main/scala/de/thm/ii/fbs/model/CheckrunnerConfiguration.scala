package de.thm.ii.fbs.model

/**
  * Checker configuration
  * @param checkerType The checker type, identifies the checkrunner
  * @param ord The checkrunner position in the order of checkrunner for a task
  * @param mainFileUploaded True if the main file for a checker was uploaded
  * @param secondaryFileUploaded True if the secondary file for a checker was uploaded
  * @param id The configuration id, if 0, then an id was not assigned by the system
  */
case class CheckrunnerConfiguration(
  checkerType: String,
  ord: Int,
  mainFileUploaded: Boolean = false,
  secondaryFileUploaded: Boolean = false,
  id: Int = 0,
  taskId: Int = 0,
  checkerTypeInformation: Option[CheckerTypeInformation] = None,
  isInBlockStorage: Boolean = false
)
