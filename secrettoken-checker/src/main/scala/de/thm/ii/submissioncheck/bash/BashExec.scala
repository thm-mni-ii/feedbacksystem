package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.Path

import org.slf4j.LoggerFactory

import scala.sys.process._

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpath path of shell script
  * @param name username parameter
  * @param submittedFilePath users submission saved as file
  */
class BashExec(val scriptpath: String, val name: String, val submittedFilePath: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /**
    * Class instance file
    */
  var file = new File(scriptpath)

  /**
    * Class instance absPath
    */
  var absPath = file.getAbsolutePath

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
  /**
    * exec()
    * @return exit code
    */
  def exec(): Int = {
    val stdoutStream = new ByteArrayOutputStream
    val seq = Seq("run", "--rm", "-v", absPath + ":/" + scriptpath, "-v", submittedFilePath + ":" + submittedFilePath, "bash:4.4", "bash",
      "/" + scriptpath, name, submittedFilePath)
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
