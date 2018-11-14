package de.thm.ii.submissioncheck.bash

import org.slf4j.LoggerFactory
import scala.sys.process._

/**
  * Class for executing Bourne Shell scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpath path of shell script
  * @param token shell script parameter
  */
class ShExec(val scriptpath: String, val token: String) {
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
    * Is set true when after execution the execution exitcode returns 0
    */
  var success = false
  /**
    * exec()
    * @return exit code
    */
  def exec(): Int = {
    val st = Process("sh", Seq(scriptpath, token)).lineStream_!
    output = st.mkString("\n")

    val exitCode = Process("sh", Seq(scriptpath, token)).!
    if (exitCode == 0) {
      success = true
    } else {
      logger.debug("Exit with non-zero code: " + exitCode)
    }
    exitcode = exitCode
    exitCode
  }
}
