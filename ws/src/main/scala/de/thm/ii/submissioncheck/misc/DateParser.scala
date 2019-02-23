package de.thm.ii.submissioncheck.misc

import java.time.LocalDate
import java.time.format.{DateTimeFormatter, DateTimeParseException}

/**
  * A simple parser object to convert input string as a date
  */
object DateParser {
  /**
    * Parse string to date
    * @author Benjamin Manns
    * @param text a string containing a date
    * @return parsed Date (LocalDate)
    */
  def dateParser(text: String): LocalDate = {
    val patterns = List("yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd", "HH:mm:ss,", "dd/MM/uuuu",
      "MMM dd, uuuu",
      "dd MMMM uuuu",
      "dd MMM uuuu",
      "dd-MM-uuuu", "dd.MM.yyyy")
    val trimmedText = text.trim
    var date: LocalDate = null
    for (pattern <- patterns) {
      try {
        date = LocalDate.parse(trimmedText, DateTimeFormatter.ofPattern(pattern))
      } catch {
        case _: DateTimeParseException =>
      }
    }
    date
  }
}
