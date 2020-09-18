package de.thm.ii.fbs.model

import java.io.FileWriter
import java.net.MalformedURLException
import java.nio.file.Path
import org.springframework.core.io.UrlResource
import org.springframework.http.{HttpHeaders, ResponseEntity}

/**
  * simply wrappes a FileWriter Object. Can give the resource of itself
  * @author Benjamin Manns
  * @param name     filename
  * @param basepath base path
  */
class TemporaryFileWriter(name: String, basepath: Path) {
  /** corresponding file object of file writer */
  val file = basepath.resolve(name).toFile
  /** corresponding filewriter object of file writer */
  val filewriter = new FileWriter(file)
  private final val LABEL_RESOURCE_NOT_EXIST = "Resource does not exist."
  private final val LABEL_URL_MALFORMED = "File URL is Malformed."

  /**
    * get a file resource
    * @return resource of file
    */
  def getResource(): UrlResource = {
    try {
      val resource = new UrlResource(file.toPath.toUri)
      if (resource.exists || resource.isReadable) {
        resource
      } else {
        throw new RuntimeException(LABEL_RESOURCE_NOT_EXIST)
      }
    } catch {
      case _: MalformedURLException =>
        throw new RuntimeException(LABEL_URL_MALFORMED)
    }
  }

  private def buildAttachmentHeader(filename: String): String = "attachment; filename=\"" + filename + "\""

  /**
    * get a URI compatible file resource
    * @return resource of file compatible with web stuff
    */
  def getWebResource(): ResponseEntity[UrlResource] = {
    val resource = getResource()
    if (resource.exists || resource.isReadable) {
      ResponseEntity.ok.header(HttpHeaders.CONTENT_DISPOSITION, buildAttachmentHeader(resource.getFilename)).body(resource)
    } else {
      throw new RuntimeException(LABEL_RESOURCE_NOT_EXIST)
    }
  }
}
