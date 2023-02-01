package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.Task
import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveOutputStream}
import org.apache.commons.compress.utils.IOUtils
import org.slf4j.LoggerFactory

import java.io._
import java.nio.file.Files
import scala.collection.mutable.ListBuffer

object Archiver {
  @throws[IOException]
  def pack(name: File, files: ArchiveFile*): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    for (archiveFile <- files) {
      addToArchive(out, archiveFile.file, ".", archiveFile.filename.getOrElse(archiveFile.file.getName))
    }
    out.close()
  }

  @throws[IOException]
  def packDir(tid: List[Task], name: File, files: ListBuffer[ListBuffer[ArchiveFile]]): Unit = {
    var s: Int = 0
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    files.foreach(f => {
      for (archiveFile <- f) {
        addToArchive(out, archiveFile.file, s"./${tid(s).id}", archiveFile.filename.getOrElse(archiveFile.file.getName))
      }
      s+=1
    })
    out.close()
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
