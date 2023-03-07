package de.thm.ii.fbs.services.runner

import de.thm.ii.fbs.services.{DockerService, FileService}
import de.thm.ii.fbs.types.{DockerCmdConfig, RunArgs, Runner, Submission}
import de.thm.ii.fbs.util.RunnerException
import io.vertx.core.json.JsonObject

import java.nio.file.Path

/**
  * BashRunnerService provides all functions to start a Bash Runner
  *
  * @param runner     Runner Configuration
  * @param submission the Submission to Check
  * @author Max Stephan
  */
class BashRunnerService(val runner: Runner, val submission: Submission) {
  private val MAIN_FILE_MOUNT = s"/runner/main-file"
  private val SECONDARY_FILE_MOUNT = s"/runner/secondary-file"
  private val SOURCE_FOLDER = s"/runner"
  private var tmpFolder: Option[Path] = None

  /** 0
    * Create a DockerCmd Configuration for a BashRunner
    *
    * @return DockerCmd Config
    */
  def getDockerCmd: DockerCmdConfig = {
    /*Get Docker Options*/
    // Read the first line of the Script File to check if is a php script TODO May improve/remove
    val scriptContent = FileService.fileToString(runner.paths.mainFile.toFile)
    val interpreter = if (scriptContent.split("\n").head.matches("#!.*php.*")) "php" else "bash"

    val submissionMount = s"$SOURCE_FOLDER/${submission.solutionFileLocation.getFileName}"

    /* Build Docker Command */
    var mountFiles = Seq(
      (runner.paths.mainFile.toString, MAIN_FILE_MOUNT),
      (submission.solutionFileLocation.toString, submissionMount))

    var runOptions = Seq(interpreter, MAIN_FILE_MOUNT, submission.user.username, submissionMount)

    // If runner has secondary file add it to Docker configuration
    if (runner.paths.secondaryFile.isDefined) {
      mountFiles = mountFiles :+ (runner.paths.secondaryFile.toString, SECONDARY_FILE_MOUNT)
      runOptions = runOptions :+ SECONDARY_FILE_MOUNT
    }

    new DockerCmdConfig(DockerService.getBashImage, DockerService.convertMountLocation(mountFiles), runOptions = runOptions)
  }

  /**
    * Copy all used files to an Tmp dir
    */
  def prepareRunnerStart(runArgs: RunArgs): Unit = {
    // TODO improve?
    val tmp = FileService.createTempFolder(submission)

    FileService.prepareRunArgsFiles(runArgs, Option(tmp))
    this.checkFiles()

    tmpFolder = Option(FileService.createTempFolder(submission))
  }

  /**
    * Check if all needed Files existing
    *
    * @throws RuntimeException if the needed Files are not Present
    */
  private def checkFiles(): Unit = {
    val checkMain = runner.paths.mainFile.toFile.isFile
    val checkSecond = runner.paths.secondaryFile.isEmpty || runner.paths.secondaryFile.get.toFile.isFile
    val checkSubmission = submission.solutionFileLocation.toFile.isFile

    if (!(checkMain && checkSecond && checkSubmission)) {
      throw new RunnerException(s"Missing submission or config files")
    }
  }

  /**
    * Transforms the Result into an JsonObject.
    * It also Checks if the stderr is empty if not it willl change the exit code to 42
    *
    * @param exitCode Runner exit Code
    * @param stdout   Runner standard Output
    * @param stderr   Runner standard error Output
    * @return The Runner Results in a Map
    */
  def transformResult(exitCode: Int, stdout: String, stderr: String): JsonObject = {
    /*If stdout Contains Something change exit code to 42*/
    var checkedExitCode = exitCode
    if (stderr.nonEmpty && checkedExitCode == 0) checkedExitCode = 42

    val res = new JsonObject()
    res.put("ccid", runner.id)
      .put("sid", submission.id)
      .put("exitCode", checkedExitCode)
      .put("stdout", stdout)
      .put("stderr", stderr)
  }

  /**
    * Delete all Temporary created files
    */
  def cleanUp(): Unit = {
    FileService.cleanUpRunArgsFiles(runner, submission, tmpFolder)
  }
}
