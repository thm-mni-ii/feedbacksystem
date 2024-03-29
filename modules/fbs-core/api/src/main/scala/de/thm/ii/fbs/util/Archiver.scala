package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.User
import de.thm.ii.fbs.model.task.Task
import org.apache.commons.compress.archivers.ArchiveOutputStream
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream
import org.apache.commons.compress.utils.IOUtils
import org.apache.tika.mime.MimeTypes

import java.io._
import java.nio.file.Files
import scala.collection.mutable.ListBuffer

object Archiver {
  @throws[IOException]
  def packSubmissions(name: File, files: List[File], users: List[User], fileExts: List[String]): Unit = {
    val out = new ZipArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    for ((file, index) <- files.zipWithIndex) {
      addToArchive(out, file, ".", s"${users(index).getName}${fileExts(index)}")
    }
    out.close()
  }

  @throws[IOException]
  def packSubmissionsInDir(name: File, files: ListBuffer[List[File]], users: ListBuffer[List[User]], fileExts: ListBuffer[List[String]],
                           listTaskId: List[Int]): Unit = {
    val out = new ZipArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    files.zipWithIndex.foreach(listFiles => {
      listFiles._1.zipWithIndex.foreach(f => {
        val fileExt = fileExts(listFiles._2)(f._2)
        addToArchive(out, f._1, s"./${listTaskId(listFiles._2)}", s"${users(listFiles._2)(f._2).getName}$fileExt")
      })
    })
    out.close()
  }

  private def fileExtensionFromContentType(contentType: String): String = {
    val allTypes = MimeTypes.getDefaultMimeTypes
    allTypes.forName(contentType).getExtension
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

  def addToArchive(out: ArchiveOutputStream, file: File, dir: String, name: String): Unit = {
    val entry = dir + File.separator + name
    if (file.isFile) {
      out.putArchiveEntry(out.createArchiveEntry(file, entry))
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
