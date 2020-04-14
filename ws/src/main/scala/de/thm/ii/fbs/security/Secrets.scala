package de.thm.ii.fbs.security
import java.text.SimpleDateFormat
import java.util.Calendar
import scala.util.Random

/**
  * Secrets holds static data used for Security operations
  * @author Benjamin Manns
  */
object Secrets {
  /**
    * creates a random String based contain current time and random String
    * @author Benjamin Manns
    * @return a random String
    */
  def getRandomStringByDateNow(): String = {
    val format = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss aa")
    val random = new Random()
    val stringLength = 20

    format.format(Calendar.getInstance().getTime) + random.nextString(stringLength)
  }

  /**
    * creates a random sha1 string based contain current time and random String
    * @author Benjamin Manns
    * @return a random SHA
    */
  def getSHAStringFromNow(): String = {
    val md = java.security.MessageDigest.getInstance("SHA-1")
    md.digest(getRandomStringByDateNow().getBytes("UTF-8")).map("%02x".format(_)).mkString
  }
}
