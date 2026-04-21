package de.thm.ii.fbs.services.security

import java.io.ByteArrayOutputStream
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.Base64
import java.util.zip.{Deflater, DeflaterOutputStream}

/**
  * Encodes an XML string for use as a SAML HTTP-Redirect binding query parameter.
  *
  * The SAML spec (section 3.4.4.1) requires:
  *   1. Deflate-compress the UTF-8 bytes (raw deflate, no zlib/gzip header)
  *   2. Base64-encode the compressed bytes
  *   3. URL-encode the Base64 string
  */
object DeflateEncoder {
  def encode(xml: String): String = {
    val bytes = xml.getBytes(StandardCharsets.UTF_8)

    val deflater = new Deflater(Deflater.DEFAULT_COMPRESSION, true) // `true` = raw DEFLATE (no header)
    val baos = new ByteArrayOutputStream()
    val dos = new DeflaterOutputStream(baos, deflater)
    dos.write(bytes)
    dos.finish()
    dos.close()

    val compressed = baos.toByteArray
    val b64 = Base64.getEncoder.encodeToString(compressed)
    URLEncoder.encode(b64, StandardCharsets.UTF_8.name())
  }
}
