package de.thm.ii.fbs.model

/**
  * An abstract class represendinc checker type dependent information for checkrunner configuration
  */
abstract sealed class CheckerTypeInformation

case class EmptyCheckerInformation() extends CheckerTypeInformation

/**
  * The SQL-Checker Information
  *
  * @param solution the solution
  * @param showHints if true show hints
  * @param showHintsAt after what amount of attempts to show hints
  * @param showExtendedHints if true show extended hints
  * @param showExtendedHintsAt after what amount of attempts to show extended hints
  */
case class SpreadsheetCheckerInformation(
  solution: String,
  showHints: Boolean,
  showHintsAt: Int,
  showExtendedHints: Boolean,
  showExtendedHintsAt: Int
) extends CheckerTypeInformation
