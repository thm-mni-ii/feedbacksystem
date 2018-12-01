package de.thm.ii.submissioncheck.security

import java.text.SimpleDateFormat
import java.util.Calendar
import javax.xml.bind.DatatypeConverter

/**
  * Secrets holds static data used for Security operations
  * @author Benjamin Manns
  */
object Secrets {
  /** currently constant but later dynamicall content used for SUPER_SECRET_KEY*/
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
}
