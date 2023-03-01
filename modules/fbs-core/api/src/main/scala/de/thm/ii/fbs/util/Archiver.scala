package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.{ArchivIterator, Task, TaskImportFiles}
import org.apache.commons.compress.archivers.ArchiveStreamFactory
import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveInputStream, TarArchiveOutputStream}
import org.apache.commons.compress.utils.IOUtils
import org.slf4j.LoggerFactory

import java.io._
import java.nio.file.Files
import scala.collection.mutable.ListBuffer

object Archiver {
  private val logger = LoggerFactory.getLogger(this.getClass)
  @throws[IOException]
  def unpack(files: InputStream): ListBuffer[TaskImportFiles] = {
    val tmp = new ArchiveStreamFactory().createArchiveInputStream(ArchiveStreamFactory.TAR, files).asInstanceOf[TarArchiveInputStream]
    var taskImportFiles: TaskImportFiles = TaskImportFiles("", ListBuffer())
    val list: ListBuffer[TaskImportFiles] = ListBuffer()
    var current = ""
    var entry: TarArchiveEntry = null
    /*while ({
      entry = tmp.getNextTarEntry;
      entry != null
    }) {*/
      new ArchivIterator(tmp).foreach(entry => {
      if (entry.isFile) {
        val s = entry.getSize
        val split = entry.getName.split("/")
        val name = split(split.length - 1)
        if (!current.matches(split(split.length - 2))) {
          if (!current.isBlank) {
            list += taskImportFiles
            taskImportFiles = TaskImportFiles("", ListBuffer())
          }
          current = split(split.length - 2)
        }
        var c = 0
        val fileWriter: BufferedWriter = setTaskImportFile(name, current, taskImportFiles)
        for (size <- 1 until s.toInt) {
          c = tmp.read
          fileWriter.write(c)
        }
        fileWriter.close()
      }
    })
    list += taskImportFiles
    list
  }

  private def setTaskImportFile(name: String, current: String, taskImportFiles: TaskImportFiles): BufferedWriter = {
    if (name.endsWith(".json")) {
      val tname = current + name
      taskImportFiles.taskConfigPath = tname
      new BufferedWriter(new FileWriter(tname))
    } else {
      taskImportFiles.configFiles += name
      new BufferedWriter(new FileWriter(name))
    }
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
