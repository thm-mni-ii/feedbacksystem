package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.{Path, Paths}
import de.thm.ii.submissioncheck.SecretTokenChecker.ULDIR
import org.slf4j.LoggerFactory

import scala.sys.process.Process

/**
  * Class for executing Plagiat scripts
  *
  * @author Benjamin Manns
  * @param courseid of submitted task
  * @param plagiatCheckBasePath users submission saved all in a folder
  */
class PlagiatCheckExec(val courseid: String, val plagiatCheckBasePath: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  private val __option_v = "-v"
  private val __slash = "/"
  private val __colon = ":"
  private val startCode = -99
  /** save the success of our execution */
  var success: Boolean = false
  /** save the exit code of our execution */
  var exitCode: Int = startCode
  /** save the output of our execution */
  var output: String = ""
  /**
    * simply display some usefull status information
    * @return string describing PlagiatCheckExec
    */
  override def toString: String = s"PlagiatCheckExec(success=$success,exitCode=$exitCode,output=$output) [" + super.toString + "]"

  /**
    * exec()
    *
    * @return exit code
    */
  def exec(): Int = {
    var dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    if (dockerRelPath == null) {
      dockerRelPath = ULDIR
    }

    // TODO Put that script htere somehow
    val plagiatWorkingDir = Paths.get(s"$dockerRelPath/PLAGIAT_CHECK/$courseid/").toAbsolutePath.toString
    val plagiatScriptPath = s"$plagiatWorkingDir/scriptfile.sh"
    val localScriptPath = Paths.get(s"$ULDIR/PLAGIAT_CHECK/$courseid/scriptfile.sh").toAbsolutePath.toString
    val unzipedDir = plagiatWorkingDir + "/unzip"
    val stdoutStream = new ByteArrayOutputStream

    var seq: Seq[String] = null

    seq = Seq("run", "--rm", __option_v, s"$plagiatScriptPath:$localScriptPath", __option_v, s"$unzipedDir:$unzipedDir", "--env",
        "USERS_SUBMISSION_DIR=" + unzipedDir, "bash:4.4", "bash", localScriptPath)

    val exitCode = Process("docker", seq).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    if (exitCode == 0) {
      success = true
    } else {
      logger.debug("Exit with non-zero code: " + exitCode)
      success = false
    }
    this.exitCode = exitCode
    exitCode
  }
}
