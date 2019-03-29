package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.{Path, Paths}

import de.thm.ii.submissioncheck.SecretTokenChecker.ULDIR
import org.slf4j.LoggerFactory

import scala.sys.process._

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param taskid of submitted task
  * @param name username parameter
  * @param submittedFilePath users submission saved as file
  */
class BashExec(val taskid: String, val name: String, val submittedFilePath: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)

  /**
    * Class instance output
    */
  var output = ""

  /**
    * Class instance exitcode
    * The exit code of the script
    */
  var exitcode = 1

  /**
    * Class instance success
    * Is set true when after execution the exitcode becomes 0
    */
  var success = false

  private val __option_v = "-v"

  /**
    * exec()
    * @return exit code
    */
  def exec(): Int = {
    /*var file = new File(scriptpath)
    var absPath = file.getAbsolutePath
    val testfile = new File(Paths.get(ULDIR).resolve(taskid).resolve("scriptfile").toString)*/
    val baseFilePath = Paths.get(ULDIR).resolve(taskid)

    val absPath = new File(baseFilePath.resolve("scriptfile").toString).getAbsolutePath

    val testfileFile = new File(baseFilePath.resolve("testfile").toString)
    val testfilePath = testfileFile.getAbsolutePath

    val testfileEnvParam = if (testfileFile.exists() && testfileFile.isFile) { testfilePath } else ""

    val stdoutStream = new ByteArrayOutputStream
    val seq = Seq("run", "--rm", __option_v, absPath + ":/" + absPath, __option_v, testfilePath + ":/" + testfilePath,
      __option_v, submittedFilePath + ":" + submittedFilePath, "--env", "TESTFILE_PATH=" + testfileEnvParam, "bash:4.4", "bash",
      "/" + absPath, name, submittedFilePath)
    val exitCode = Process("docker", seq).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    if (exitCode == 0) {
      success = true
    } else {
      logger.debug("Exit with non-zero code: " + exitCode)
    }
    exitcode = exitCode
    exitCode
  }
}
