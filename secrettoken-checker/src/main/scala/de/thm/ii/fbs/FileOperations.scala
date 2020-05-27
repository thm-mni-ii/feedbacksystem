package de.thm.ii.fbs

import java.io.{ByteArrayInputStream, File, FileInputStream, FileOutputStream}
import java.nio.file.{FileAlreadyExistsException, Files, Path, StandardCopyOption}
import java.util.zip.{ZipEntry, ZipInputStream, ZipOutputStream}
import org.apache.commons.io.FileUtils
import scala.io.Source
/**
  * simply handles file operation to access them easily
  */
object FileOperations {
  /**
    * copy a directoy
    *
    * @param from the from path
    * @param to   this is the folder where the file should copied in
    * @return boolean if it was successful
    */
  def copy(from: File, to: File): Boolean = {
    try {
      FileUtils.copyDirectory(from, to)
      true
    } catch {
      case e: Exception => {
        false
      }
    }
  }

  /**
    * read from a file by its path
    * @param where where the file is stored
    * @return content of file
    */
  def readFromFile(where: Path): String = {
    Source.fromFile(where.toAbsolutePath.toString).mkString; //returns the file data as String
  }

  /**
    * Deletes a dir recursively deleting anything inside it.
    *
    * @author https://stackoverflow.com/users/306602/naikus by https://stackoverflow.com/a/3775864/5885054
    * @param dir The dir to delete
    * @return true if the dir was successfully deleted
    */
  def rmdir(dir: File): Boolean = {
    if (!dir.exists() || !dir.isDirectory) {
      false
    } else {
      val files = dir.list()
      for (file <- files) {
        val f = new File(dir, file)
        if (f.isDirectory()) {
          rmdir(f)
        } else {
          f.delete()
        }
      }
      dir.delete()
    }
  }

  /**
    * A simple write to file wrapper
    *
    * @param what  the content what to write
    * @param where the destination of the file
    * @return boolean if it was successful
    */
  def writeToFile(what: String, where: Path): Boolean = {
    try {
      val is = new ByteArrayInputStream(what.getBytes)
      Files.copy(is, where, StandardCopyOption.REPLACE_EXISTING)
      true
    }
    catch {
      case _: FileAlreadyExistsException => false
    }
  }

  /**
    * Zip several files to one zip folder
    *
    * @param out         destination path where zip should be saved
    * @param files       list of files to zip
    * @param replacePath substring which should be removed from filenames
    */
  def complexZip(out: Path, files: Iterable[Path], replacePath: String = ""): Unit = {
    val zip = new ZipOutputStream(Files.newOutputStream(out))

    files.foreach { file =>
      try {
        val asFile = new File(file.toString)
        if (asFile.isFile) {
          zip.putNextEntry(new ZipEntry(file.toString.replace(replacePath, "")))
          Files.copy(file, zip)
        }

      } catch {
        case _: java.nio.file.NoSuchFileException => {}
      }
      zip.closeEntry()
    }
    zip.close()
  }

  /**
    * simply zip a file into out
    *
    * @param out destination path where zip should be saved
    * @param in  main src path where from zip should be created
    */
  def zip(out: Path, in: String): Unit = {
    val filesToZip: List[Path] = tree(new File(in)).toList.map(f => f.toPath)
    complexZip(out, filesToZip, in)
  }

  /**
    * tree works like scan_dir in php, thanksfull copied from https://stackoverflow.com/a/8340937/5885054
    *
    * @param root       the staring point to scan the dir
    * @param skipHidden skipp hidden files like . or ..
    * @return a stream of files
    */
  def tree(root: File, skipHidden: Boolean = false): LazyList[File] = {
    if (!root.exists || (skipHidden && root.isHidden)) {
      LazyList.empty
    }
    else {
      root #:: (
        root.listFiles match {
          case null => LazyList.empty
          case files: Any => LazyList.from(files).flatMap(tree(_, skipHidden))
        })
    }
  }

  /** a bit based on https://stackoverflow.com/a/30642526
    * It is more a JAVA way
    *
    * @param zip      downloaded zip path
    * @param outputFolder where to extract
    */
  def unzip(zip: Path, outputFolder: Path): Unit = {
    val zipFile = zip.toAbsolutePath.toString
    val one_K_size = 1024
    val fis = new FileInputStream(zipFile)
    val zis = new ZipInputStream(fis)
    LazyList.continually(zis.getNextEntry).takeWhile(_ != null).foreach { file =>
      var filename = file.getName
      if (filename.charAt(0) == '/') filename = filename.substring(1)
      val fullFilePath = outputFolder.toAbsolutePath.resolve(filename)
      if (file.isDirectory) {
        mkdir(fullFilePath)
      } else {
        if (!Files.exists(fullFilePath.getParent)) mkdir(fullFilePath.getParent)
        val fout = new FileOutputStream(fullFilePath.toString)
        val buffer = new Array[Byte](one_K_size)
        LazyList.continually(zis.read(buffer)).takeWhile(_ != -1).foreach(fout.write(buffer, 0, _))
      }
    }
  }

  /**
    * simple make dir method
    * @param dir path where the dir should created
    * @return if mkdir worked out
    */
  def mkdir(dir: Path): Boolean = {
    try {
      Files.createDirectories(dir)
      true
    }
    catch {
      case e: FileAlreadyExistsException => {
        false
      }
    }
  }
}
