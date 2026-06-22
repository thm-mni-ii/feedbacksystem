package de.thm.ii.fbs.util

import org.apache.tika.mime.MimeTypes
import org.springframework.http.MediaType

object ExtensionUtils {
  def getExtensionFromMimeType(mimeType: String): (MediaType, String) =
    (MediaType.valueOf(mimeType), MimeTypes.getDefaultMimeTypes.forName(mimeType).getExtension)
}
