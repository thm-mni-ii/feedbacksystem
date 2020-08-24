package de.thm.ii.fbs.services.core

import java.io.IOException
import java.nio.file._

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

import scala.sys.process.processInternal.InputStream

/**
  * Handles file of tasks and submissions.
  */
@Component
class StorageService {
  @Value("${storage.uploadDir}")
  private def uploadDir(): String = null

  private def tasksDir(tid: Int) = Path.of(uploadDir()).resolve("tasks").resolve(String.valueOf(tid))
  private def submissionDir(sid: Int) = Path.of(uploadDir()).resolve("submissions").resolve(String.valueOf(sid))

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
    * Delete a main file
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteMainFile(tid: Int): Boolean = pathToMainFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete a secondary file
    * @param tid Task id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSecondaryFile(tid: Int): Boolean = pathToSecondaryFile(tid).exists(Files.deleteIfExists)

  /**
    * Delete a solution file
    * @param sid Submission id
    * @return True if deteled, false if not file exists
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def deleteSolutionFile(sid: Int): Boolean = pathToSolutionFile(sid).exists(Files.deleteIfExists)
}
