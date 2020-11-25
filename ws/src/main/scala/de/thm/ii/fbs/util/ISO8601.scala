package de.thm.ii.fbs.util
import java.text.SimpleDateFormat

/**
  * Contains the ISO601 format
  */
object ISO8601 {
  /**
    * The ISO601 format
    */
  val simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
}
