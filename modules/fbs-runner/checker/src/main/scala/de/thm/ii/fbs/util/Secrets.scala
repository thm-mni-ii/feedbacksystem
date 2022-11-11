package de.thm.ii.fbs.util

import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Calendar
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import scala.util.Properties

/**
  * Secrets holds static data used for Security operations
  *
  * @author Benjamin Manns
  */
object Secrets {
  /** Secret used to generate the HMAC* */
  private final val HMAC_SECRET = Properties.envOrElse("HMAC_SECRET", "uigbduhegafudegufqu8o3q4tgru4ieubfiel")

  /**
    * creates a random String based contain current time and random String
    *
    * @author Benjamin Manns
    * @return a random String
    */
  def getRandomStringByDateNow(): String = {
    var randomString = ""
    val format = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss aa")
    randomString += format.format(Calendar.getInstance().getTime())
    val r = new scala.util.Random()
    val stringLength = 20
    randomString += r.nextString(stringLength)
    randomString
  }

  /**
    * creates a random sha1 string based contain current time and random String
    *
    * @author Benjamin Manns
    * @return a random SHA
    */
  def getSHAStringFromNow(): String = {
    val md = java.security.MessageDigest.getInstance("SHA-1")
    md.digest(getRandomStringByDateNow().getBytes("UTF-8")).map("%02x".format(_)).mkString
  }

  /**
    * creates a random sha1 string based on SecureRandom
    *
    * @author Max Stephan
    * @return a random SHA
    */
  def getSHAStringFromRandom(): String = {
    val md = java.security.MessageDigest.getInstance("SHA-1")
    val buffer = Array[Byte](32)
    new SecureRandom().nextBytes(buffer)
    md.digest(buffer).map("%02x".format(_)).mkString
  }

  /**
    * Generates a HMAC from a string
    *
    * @param value The Value Used to generate the HMAC
    * @return
    */
  def generateHMAC(value: String): String = {
    val secret = new SecretKeySpec(HMAC_SECRET.getBytes, "HmacSHA256")
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(secret)
    val hashString: Array[Byte] = mac.doFinal(value.getBytes)
    hashString.map("%02x".format(_)).mkString
  }
}
