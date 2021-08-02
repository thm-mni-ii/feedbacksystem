package de.thm.ii.fbs.services.persistence

import java.io.{File, IOException}
import java.nio.file._
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

import scala.io.Source

/**
  * Handles file of tasks and submissions.
  */
@Component
class StorageService {
  @Value("${storage.uploadDir}")
  private val uploadDir: String = null
  private def uploadDirPath: Path = Path.of(uploadDir)

  private def tasksDir(tid: Int) = uploadDirPath.resolve("tasks").resolve(String.valueOf(tid))
  private def submissionDir(sid: Int) = uploadDirPath.resolve("submissions").resolve(String.valueOf(sid))

  private def getFileContent(path: Option[Path]): String = {
    if (path.isDefined) {
      val source = Source.fromFile(path.get.toFile)

      try {
        source.mkString
      } finally {
        source.close()
      }
    } else {
      ""
    }
  }

  /**
    * Store (replace if exists) the main file of a task
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeMainFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve("main-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the secondary file of a task
    * @param tid Task id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSecondaryFile(tid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve("secondary-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    * @param sid Submission id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFile(sid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(submissionDir(sid)).resolve("solution-file"), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Get the path to the main file of a task
    * @param tid Task id
    * @return The path to the file
    */
  def pathToMainFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve("main-file")).filter(Files.exists(_))

  /**
    * Get the path to the secondary file of a task
    * @param tid Task id
    * @return The path to the file
    */
  def pathToSecondaryFile(tid: Int): Option[Path] = Option(tasksDir(tid).resolve("secondary-file")).filter(Files.exists(_))

  /**
    * Get the path to the solution file of a submission
    * @param sid Submission id
    * @return The path to the file
    */
  def pathToSolutionFile(sid: Int): Option[Path] = Option(submissionDir(sid).resolve("solution-file")).filter(Files.exists(_))

  /**
    * Gets the Content of the solution file
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFile(sid: Int): String = getFileContent(pathToSolutionFile(sid))

  /**
    * Delete a main file
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteMainFile(tid: Int): Boolean = pathToMainFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete a secondary file
    *
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSecondaryFile(tid: Int): Boolean = pathToSecondaryFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete the Configuration Folder with all Files inside
    *
    * @param tid Task id
    * @return True if deteled, false if not Directory exists
    * @throws IOException If the i/o operation fails
    */
  def deleteConfiguration(tid: Int): Boolean = {
    deleteFolder(tasksDir(tid))
  }

  /**
    * Delete a solution file
    *
    * @param sid Submission id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSolutionFile(sid: Int): Boolean = deleteFolder(submissionDir(sid))

  private def deleteFolder(path: Path) = {
    val confDir = path.toFile

    if (confDir.exists() && confDir.isDirectory) {
      FileUtils.deleteDirectory(confDir)
      true
    } else {
      false
    }
  }
}
