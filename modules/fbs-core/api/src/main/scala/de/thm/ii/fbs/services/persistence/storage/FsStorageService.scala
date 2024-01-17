package de.thm.ii.fbs.services.persistence.storage

import de.thm.ii.fbs.model.{storageBucketName, storageFileName}
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

import java.io.{File, FileOutputStream, IOException}
import java.nio.file.{Files, Path, StandardCopyOption}
import scala.io.Source

@Component
class FsStorageService {
  def openClone(path: Path): File = {
    val tmpFile = File.createTempFile("fs-tmp-", null)
    Files.copy(path, new FileOutputStream(tmpFile))
    tmpFile
  }

  @Value("${storage.uploadDir}")
  private val uploadDir: String = null

  private def uploadDirPath: Path = Path.of(uploadDir)

  private def tasksDir(tid: Int) = uploadDirPath.resolve(storageBucketName.CHECKER_CONFIGURATION_FOLDER).resolve(String.valueOf(tid))

  private def submissionDir(sid: Int) = uploadDirPath.resolve(storageBucketName.SUBMISSIONS_BUCKET).resolve(String.valueOf(sid))

  def getFileContent(path: Option[Path]): String = {
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

  @throws[IOException]
  def storeConfigurationFile(tid: Int, src: Path, fileName: String): Unit =
    Files.move(src, Files.createDirectories(tasksDir(tid)).resolve(fileName), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Store (replace if exists) the solution file a submission
    *
    * @param sid Submission id
    * @param src Current path to the file
    * @throws IOException If the i/o operation fails
    */
  @throws[IOException]
  def storeSolutionFile(sid: Int, src: Path): Unit =
    Files.move(src, Files.createDirectories(submissionDir(sid)).resolve(storageFileName.SOLUTION_FILE), StandardCopyOption.REPLACE_EXISTING)

  /**
    * Get the path to the main file of a task
    *
    * @param ccid Checker Configuration id
    * @return The path to the file
    */
  def pathToMainFile(ccid: Int): Option[Path] = Option(tasksDir(ccid).resolve(storageFileName.MAIN_FILE)).filter(Files.exists(_))

  /**
    * Get the path to the secondary file of a task
    *
    * @param ccid Checker Configuration id
    * @return The path to the file
    */
  def pathToSecondaryFile(ccid: Int): Option[Path] = Option(tasksDir(ccid).resolve(storageFileName.SECONDARY_FILE)).filter(Files.exists(_))

  /**
    * Get the path to the solution file of a submission
    *
    * @param sid Submission id
    * @return The path to the file
    */
  def pathToSolutionFile(sid: Int): Option[Path] = Option(submissionDir(sid).resolve(storageFileName.SOLUTION_FILE)).filter(Files.exists(_))

  /**
    * Gets the Content of the solution file
    *
    * @param sid Submission id
    * @return The Solution file content
    */
  def getSolutionFile(sid: Int): String = getFileContent(pathToSolutionFile(sid))

  /**
    * Gets the Content of the main file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getMainFile(ccid: Int): String = getFileContent(pathToMainFile(ccid))

  /**
    * Gets the Content of the secondary file
    *
    * @param ccid Checkrunner id
    * @return The Solution file content
    */
  def getSecondaryFile(ccid: Int): String = getFileContent(pathToSecondaryFile(ccid))

  /**
    * Delete a main file
    *
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
