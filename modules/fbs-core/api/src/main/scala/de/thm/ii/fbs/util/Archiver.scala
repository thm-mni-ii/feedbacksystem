package de.thm.ii.fbs.util

import de.thm.ii.fbs.model.TaskImportFiles
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
  def pack(name: File, files: ArchiveFile*): Unit = {
    val out = new TarArchiveOutputStream(new BufferedOutputStream(Files.newOutputStream(name.toPath)))
    for (archiveFile <- files) {
      addToArchive(out, archiveFile.file, ".", archiveFile.filename.getOrElse(archiveFile.file.getName))
    }
    out.close()
  }

  @throws[IOException]
  def unpack(cid: Int, files: InputStream): (TaskImportFiles, List[TaskImportFiles]) = {
    val tmp = new ArchiveStreamFactory().createArchiveInputStream(ArchiveStreamFactory.TAR, files).asInstanceOf[TarArchiveInputStream]
    val taskImportFiles: TaskImportFiles = TaskImportFiles("", ListBuffer())
    val test: List[TaskImportFiles] = List()
    var entry: TarArchiveEntry = null
    while ( {
      entry = tmp.getNextTarEntry;
      entry != null
    }) {
      if (entry.isFile) {
        //new ArchivIterator(tmp).foreach(entry => {
        val s = entry.getSize
        val name = entry.getName
        var c = 0
        val fileWriter = new BufferedWriter(new FileWriter(name))
        if (name.endsWith(".json")) {
          taskImportFiles.taskConfigPath = name
        } else {
          taskImportFiles.configFiles += name
        }
        var test = 0
        while (test < s) {
          //for (size <- test to entry.getSize - 1) {
          c = tmp.read
          fileWriter.write(c)
          test += 1
        }
        fileWriter.close()
        taskImportFiles
      }
      else
      {
        test.appended(p(tmp, entry, test))
      }
    }
    (taskImportFiles, test)
  }

  def p(tmp: TarArchiveInputStream, entry: TarArchiveEntry, test: List[TaskImportFiles]): TaskImportFiles = {
    val taskImportFiles: TaskImportFiles = TaskImportFiles("", ListBuffer())
    for(e <- entry.getDirectoryEntries) {
      if (entry.isFile) {
        //new ArchivIterator(tmp).foreach(entry => {
        val s = entry.getSize
        val name = entry.getName
        var c = 0
        val fileWriter = new BufferedWriter(new FileWriter(name))
        if (name.endsWith(".json")) {
          taskImportFiles.taskConfigPath = name
        } else {
          taskImportFiles.configFiles += name
        }
        var test = 0
        while (test < s) {
          c = tmp.read
          fileWriter.write(c)
          test += 1
        }
        fileWriter.close()
      }
      else {
        test.appended(p(tmp, entry, test))
      }
    }
    taskImportFiles
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
