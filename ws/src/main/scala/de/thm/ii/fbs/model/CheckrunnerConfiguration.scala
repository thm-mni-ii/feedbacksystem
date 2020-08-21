package de.thm.ii.fbs.model

/**
  * Checker configuration
  * @param checkerType The checker type, identifies the checkrunner
  * @param mainFile The path to the main file for the check runner
  * @param secondaryFile The path to the secondary file for the check runner.
  *                      This file path can be optional. The optionality depends
  *                      on the actual checkrunner.
  * @param ord The checkrunner position in the order of checkrunner for a task
  * @param id The configuration id, if 0, then an id was not assigned by the system
  */
case class CheckrunnerConfiguration(checkerType: String, mainFile: String,
                                    secondaryFile: Option[String] = None, ord: Int, id: Int = 0)
