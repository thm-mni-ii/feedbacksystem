package de.thm.ii.submissioncheck.services

import java.io.{ByteArrayInputStream, File, FileInputStream, FileOutputStream}
import java.nio.file.{FileAlreadyExistsException, Files, Path, Paths, StandardCopyOption}
import java.util.Calendar
import java.util.zip.{ZipEntry, ZipInputStream, ZipOutputStream}

import org.apache.commons.io.FileUtils

import scala.io.Source

/**
  * simply preserves date and time conversions
  */
object DateTimeOperation {
  /**
    * simply load a unix timestamp and return a formatted string
    * @param timestamp unix timestamp in milliseconds
    * @return formatted datetime string
    */
  def fromTimestamp(timestamp: Long): String = {
    val calendar = Calendar.getInstance
    val leadingZerosTwo = "%02d"
    calendar.setTimeInMillis(timestamp)

    var formattedDateTime = "%04d".format(calendar.get(Calendar.YEAR))
    formattedDateTime += "-" + leadingZerosTwo.format(calendar.get(Calendar.MONTH) + 1)
    formattedDateTime += "-" + leadingZerosTwo.format(calendar.get(Calendar.DAY_OF_MONTH))
    formattedDateTime += " " + leadingZerosTwo.format(calendar.get(Calendar.HOUR_OF_DAY))
    formattedDateTime += ":" + leadingZerosTwo.format(calendar.get(Calendar.MINUTE))
    formattedDateTime += ":" + leadingZerosTwo.format(calendar.get(Calendar.SECOND))

    formattedDateTime
  }

  /**
    * simply load a unix timestamp and return a formatted string
    * @param timestamp unix timestamp as string
    * @return formatted datetime string
    */
  def fromTimestamp(timestamp: String): String = {
    val timestampLong: Long = timestamp.toLong
    fromTimestamp(timestampLong)
  }
}
