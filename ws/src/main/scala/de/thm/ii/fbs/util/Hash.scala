package de.thm.ii.fbs.util

import java.security.MessageDigest

/**
  * Contains hashing algorithms.
  * @author Andrej Sajenko
  */
object Hash {
  /**
    * Hash the plain text
    * @param text plain password
    * @return the hashed password
    */
  def hash(text: String): String = MessageDigest.getInstance("SHA-1")
    .digest(text.getBytes("UTF-8")).map("%02x".format(_)).mkString
}
