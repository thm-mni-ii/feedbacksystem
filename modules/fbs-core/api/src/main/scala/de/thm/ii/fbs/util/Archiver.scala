package de.thm.ii.fbs.util

import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveInputStream, TarArchiveOutputStream}
import org.apache.commons.compress.utils.IOUtils
import org.slf4j.LoggerFactory

import java.io._
import java.nio.file.Files

object Archiver {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @throws[IOException]
  def pack(name: File, files: ArchiveFile*): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    for (archiveFile <- files) {
      addToArchive(out, archiveFile.file, ".", archiveFile.filename.getOrElse(archiveFile.file.getName))
    }
    out.close()
  }

  @throws[IOException]
  def unpack(files: TarArchiveInputStream): Unit = {
    //val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    //logger.info(files.available().toString)
    files.read();

    logger.info(files.available().toString)
    logger.info(files.getNextEntry.getName)
    //logger.info(files.readAllBytes().mkString("Array(", ", ", ")"))
    //logger.info(files.getCurrentEntry.toString)
    /*logger.info(files.getCurrentEntry.toString)
    logger.info(files.getCurrentEntry.isFile.toString)
    logger.info(files.getCurrentEntry.getName)
    logger.info(files.getCurrentEntry.getFile.toString)*/
  }


  def addToArchive(out: TarArchiveOutputStream, file: File, dir: String, name: String): Unit = {
    val entry = dir + File.separator + name
    if (file.isFile) {
      out.putArchiveEntry(new TarArchiveEntry(file, entry))
      val in = new FileInputStream(file)
      try IOUtils.copy(in, out)
      finally if (in != null) in.close()
      out.closeArchiveEntry()
    } else {
      if (file.isDirectory) {
        for (child <- file.listFiles) {
          addToArchive(out, child, entry, child.getName)
        }
      }
    }
  }

  case class ArchiveFile(file: File, filename: Option[String] = None)
}
