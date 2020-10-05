package de.thm.ii.fbs.services.runner

import java.nio.file.Path

import de.thm.ii.fbs.services.{DockerService, FileService}
import de.thm.ii.fbs.types.{DockerCmdConfig, Runner, Submission}
import de.thm.ii.fbs.util.RunnerException

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

  /**
    * Create a DockerCmd Configuration for a BashRunner
    *
    * @return DockerCmd Config
    */
  def getDockerCmd: DockerCmdConfig = {
    /*Get Docker Options*/
    // Read the first line of the Script File to check if is a php script TODO May improve/remove
    val scriptContent = FileService.fileToString(submission.solutionFileLocation.toFile)
    val interpreter = if (scriptContent.split("\n").head.matches("#!.*php.*")) "php" else "bash"

    val infoArgument = if (submission.isInfo) "info" else ""
    val submissionMount = s"$SOURCE_FOLDER/${submission.solutionFileLocation.getFileName}"

    /* Build Docker Command */
    var mountFiles = Seq(
      (runner.mainFile.toString, MAIN_FILE_MOUNT),
      (submission.solutionFileLocation.toString, submissionMount))

    if (runner.hasSecondaryFile) {
      mountFiles = mountFiles :+ (runner.secondaryFile.toString, SECONDARY_FILE_MOUNT)
    }

    // If secondary file is present add its path to an environment Variable
    val dockerOptions = if (runner.hasSecondaryFile) {
      Seq("--env", s"TESTFILE_PATH=$SECONDARY_FILE_MOUNT")
    } else {
      Seq.empty
    }

    val runOptions = Seq(interpreter, MAIN_FILE_MOUNT, submission.user.username, submissionMount, infoArgument)

    new DockerCmdConfig(DockerService.getBashImage, DockerService.convertMountLocation(mountFiles), dockerOptions, runOptions)
  }

  /**
    * Copy all used files to an Tmp dir
    */
  def prepareRunnerStart(): Unit = {
    // TODO improve?
    val tmp = FileService.createTempFolder(submission)

    /* Copy Config and Submission File to prevent than from being changed during check */
    runner.mainFile = FileService.copy(runner.mainFile, tmp)

    if (runner.hasSecondaryFile) {
      runner.secondaryFile = FileService.copy(runner.secondaryFile, tmp)
    }

    submission.solutionFileLocation = FileService.copy(submission.solutionFileLocation, tmp)

    tmpFolder = Option(tmp)
  }

  /**
    * Check if all needed Files existing
    *
    * @throws RuntimeException if the needed Files are not Present
    */
  def checkFiles(): Unit = {
    val checkMain = runner.mainFile.toFile.isFile
    val checkSecond = !runner.hasSecondaryFile || runner.secondaryFile.toFile.isFile
    val checkSubmission = submission.solutionFileLocation.toFile.isFile

    if (!(checkMain && checkSecond && checkSubmission)) {
      throw new RunnerException(s"Missing submission or config files")
    }
  }

  /**
    * Transforms the Result into an Map.
    * It also Checks if the stderr is empty if not it willl change the exit code to 42
    *
    * @param exitCode Runner exit Code
    * @param stdout   Runner standard Output
    * @param stderr   Runner standard error Output
    * @return The Runner Results in a Map
    */
  def transformResult(exitCode: Int, stdout: String, stderr: String): Map[String, Any] = {
    /*If stdout Contains Something change exit code to 42*/
    var checkedExitCode = exitCode
    if (stderr.length > 0 && checkedExitCode == 0) checkedExitCode = 42

    Map("sid" -> submission.id, "exitCode" -> checkedExitCode, "stdout" -> stdout, "stderr" -> stderr)
  }

  /**
    * Delete all Temporary created files
    */
  def cleanUp(): Unit = {
    if (tmpFolder.isDefined) {
      FileService.rmdir(tmpFolder.get.toFile)
    }
  }
}
