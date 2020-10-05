package de.thm.ii.fbs.services

import java.io.File
import java.nio.file._

import de.thm.ii.fbs.types.{RunArgs, Runner, Submission}
import de.thm.ii.fbs.util.RunnerException
import de.thm.ii.fbs.util.Secrets.getSHAStringFromNow
import org.apache.commons.io.FileUtils

import scala.util.Properties

/**
  * Handles all File Operations
  */
object FileService {
  private val INSIDE_DOCKER: Boolean = Properties.envOrElse("INSIDE_DOCKER", "false").toBoolean
  private val ULDIR: Path = Path.of(if (INSIDE_DOCKER) "/upload-dir" else "uploadDir")
  private val CONTAINER_TEMP = Path.of("/dockertemp")

  /**
    * Get all content form a File
    *
    * @param file file to read
    * @return the File as a String
    */
  def fileToString(file: File): String = {
    val source = scala.io.Source.fromFile(file)
    try {
      source.mkString
    } finally {
      source.close()
    }
  }

  /**
    * Create a Temp Folder
    *
    * @param submission the submission for which the folder is created
    * @return the Path to the new Folder
    */
  def createTempFolder(submission: Submission): Path = {
    val tmpDirName = s"s${submission.id}-${getSHAStringFromNow()}"

    try {
      if (!INSIDE_DOCKER) {
        // If used Outside of the Docker Contianer use System Temp file
        Files.createTempDirectory(tmpDirName) // TODO may create sub dir for files
      } else {
        // If used inside a Docker Container use mounted tmp dir
        Files.createTempDirectory(CONTAINER_TEMP, tmpDirName)
      }
    } catch {
      case e: Exception => throw new RunnerException(s"Invalid Temp File Configuration: ${e.getMessage}")
    }
  }

  /**
    * copy a file
    *
    * @param from the file that sold be Copied
    * @param to   the folder where the file should copied in
    * @return boolean if it was successful
    */
  def copy(from: Path, to: Path): Path = {
    try {
      val resPath = to.resolve(from.getFileName)
      FileUtils.copyFile(from.toFile, resPath.toFile)
      resPath
    } catch {
      case e: Exception =>
        throw new RunnerException(s"Could not Copy Submission Files: ${e.getMessage}")
    }
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
        if (f.isDirectory) {
          rmdir(f)
        } else {
          f.delete()
        }
      }
      dir.delete()
    }
  }

  /**
    * simple make dir method
    *
    * @param dir path where the dir should created
    * @return if mkdir worked out
    */
  def mkdir(dir: Path): Boolean = {
    try {
      Files.createDirectories(dir)
      true
    }
    catch {
      case e: FileAlreadyExistsException =>
        false
    }
  }

  /**
    * Convert the Container-Paths to the Host-Paths.
    * This function is necessary if the program is executed in a Docker-Container,
    * there the path pointing to the files in the Docker-Contianer is adjusted to fit outside the container.
    *
    * @param path the Path to change
    * @return the new Path
    */
  def getDockerTempPath(path: String): String = {
    val tmpPath = Path.of(path)
    if (INSIDE_DOCKER) {
      // TODO maybe move the env definition somewhere else
      Path.of(System.getenv("HOST_TMP_DIR")).resolve(tmpPath.subpath(CONTAINER_TEMP.getNameCount, tmpPath.getNameCount)).toString
    } else {
      tmpPath.toString
    }
  }

  /**
    * Add the Upload Dir to the Config and Submission Files
    *
    * @param runArgs Runner arguments
    */
  def addUploadDir(runArgs: RunArgs): Unit = {
    val runner: Runner = runArgs.runner
    val submission: Submission = runArgs.submission

    runner.mainFile = ULDIR.resolve(runner.mainFile)
    if (runner.hasSecondaryFile) {
      runner.secondaryFile = ULDIR.resolve(runner.secondaryFile)
    }

    submission.solutionFileLocation = ULDIR.resolve(submission.solutionFileLocation)
  }
}
