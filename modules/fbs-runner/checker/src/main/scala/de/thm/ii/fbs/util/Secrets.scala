package de.thm.ii.fbs.util

import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Calendar
import javax.xml.bind.DatatypeConverter

/**
  * Secrets holds static data used for Security operations
  *
  * @author Benjamin Manns
  */
object Secrets {
  /** currently constant but later dynamicall content used for SUPER_SECRET_KEY */
  private val SUPER_SECRET_KEY_PLAIN: String = "uigbduhegafudegufqu8o3q4tgru4ieubfiel"

  /** Base64 Binary Key */
  private val SUPER_SECRET_KEY: String = DatatypeConverter.printBase64Binary(SUPER_SECRET_KEY_PLAIN.getBytes)

  /**
    * getSuperSecretKey delivers a secure key. This is only valid for a defined time
    *
    * @author Benjamin Manns
    * @return Secure Key as String
    */
  def getSuperSecretKey: String = {
    // TODO change key by the time
    SUPER_SECRET_KEY
  }

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
}
