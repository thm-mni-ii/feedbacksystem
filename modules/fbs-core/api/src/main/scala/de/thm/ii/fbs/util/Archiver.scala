package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.{Task, User}
import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveOutputStream}
import org.apache.commons.compress.utils.IOUtils

import java.io._
import java.nio.file.Files
import javax.mail.internet.ContentType
import scala.collection.mutable.ListBuffer

import org.apache.tika.mime.MimeType
import org.apache.tika.mime.MimeTypeException
import org.apache.tika.mime.MimeTypes

object Archiver {
  @throws[IOException]
  def packSubmissions(name: File, files: List[File], users: List[User], contTypes: List[String]): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    for ((file, index) <- files.zipWithIndex) {
      val allTypes = MimeTypes.getDefaultMimeTypes
      val mimeType = allTypes.forName(contTypes(index))
      addToArchive(out, file, ".", s"${users(index).getName}${mimeType.getExtension}")
    }
    out.close()
  }

  @throws[IOException]
  def packSubmissionsInDir(name: File, files: ListBuffer[List[File]], users: ListBuffer[List[User]], contTypes: ListBuffer[List[String]]
                           , listTaskId: List[Int]): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    files.zipWithIndex.foreach(listFiles => {
      listFiles._1.zipWithIndex.foreach(f => {
        val allTypes = MimeTypes.getDefaultMimeTypes
        val mimeType = allTypes.forName(contTypes(listFiles._2)(f._2))
        addToArchive(out, f._1, s"./${listTaskId(listFiles._2)}", s"${users(listFiles._2)(f._2).getName}${mimeType.getExtension}")
      })
    })
    out.close()
  }

  @throws[IOException]
  def packDir(tid: List[Task], name: File, files: ListBuffer[ListBuffer[ArchiveFile]]): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    files.zip(tid).foreach { case (f, task) =>
      f.foreach(archiveFile => {
        addToArchive(out, archiveFile.file, s"./${task.id}", archiveFile.filename.getOrElse(archiveFile.file.getName))
        archiveFile.file.delete()
      })
    }
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
