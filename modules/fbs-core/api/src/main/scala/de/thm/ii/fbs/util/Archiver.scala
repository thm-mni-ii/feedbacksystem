package de.thm.ii.fbs.util

import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveOutputStream}
import org.apache.commons.compress.utils.IOUtils

import java.io._
import java.nio.file.{Files, Paths}

object Archiver {
  @throws[IOException]
  def pack(name: String, files: File*): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(Paths.get(name))))
    for (file <- files) {
      addToArchive(out, file, ".")
    }
    out.close()
  }

  @throws[IOException]
  def compress(outputStream: OutputStream, files: File*): TarArchiveOutputStream = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(outputStream))
    for (file <- files) {
      addToArchive(out, file, ".")
    }
    out
  }

  def addToArchive(out: TarArchiveOutputStream, file: File, dir: String): Unit = {
    val entry = dir + File.separator + file.getName
    if (file.isFile) {
      out.putArchiveEntry(new TarArchiveEntry(file, entry))
      val in = new FileInputStream(file)
      try IOUtils.copy(in, out)
      finally if (in != null) in.close()
      out.closeArchiveEntry()
    } else {
      if (file.isDirectory) {
        for (child <- file.listFiles) {
          addToArchive(out, child, entry)
        }
      }
    }
  }
}
