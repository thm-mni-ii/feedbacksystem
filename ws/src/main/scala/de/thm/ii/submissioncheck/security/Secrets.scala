package de.thm.ii.submissioncheck.security

import javax.xml.bind.DatatypeConverter

/**
  * Secrets holds static data used for Security operations
  * @author Benjamin Manns
  */
class Secrets {
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
    SUPER_SECRET_KEY
  }
}
