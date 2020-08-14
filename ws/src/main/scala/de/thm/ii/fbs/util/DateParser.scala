package de.thm.ii.fbs.util

import java.time.LocalDate
import java.time.format.{DateTimeFormatter, DateTimeParseException}

/**
  * A simple parser object to convert input string as a date
  */
object DateParser {
  /**
    * Parse string to date
    * @author Benjamin Manns
    * @param text an ISO formatted date represented as a string
    * @return An object of LocalDate
    */
  def dateParser(text: String): LocalDate = {
    val patterns = List("yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "dd/MM/uuuu", "dd-MM-uuuu", "dd.MM.yyyy")
    val trimmedText = text.trim
    var date: LocalDate = null
    for (pattern <- patterns) {
      try {
        date = LocalDate.parse(trimmedText, DateTimeFormatter.ofPattern(pattern))
      }
      catch {
        case _: DateTimeParseException => {}
      }
    }
    date
  }
}
