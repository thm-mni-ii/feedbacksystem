package de.thm.ii.submissioncheck

import scala.sys.process._
import java.io._

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpathc path of shell script
  * @param namec username parameter
  * @param tokenc shell script parameter
  */
class BashExec(val scriptpathc: String, val namec: String, val tokenc: String) {

  /**
    * Class instance scriptpath
    */
  var scriptpath = scriptpathc

  /**
    * Class instance file
    */
  var file = new File("./" + scriptpath)

  /**
    * Class instance absPath
    */
  var absPath = file.getAbsolutePath
  /**
    * Class instance namec
    */
  var name = namec
  /**
    * Class instance tokenc
    */
  var token = tokenc

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
  def exec() : Int = {

    val stdoutStream = new ByteArrayOutputStream

    val exitCode = Process("docker", Seq("run", "--rm", "-v", absPath + ":/" + scriptpath, "bash:4.4", "bash",
      "/" + scriptpath, name, token)).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    if(exitCode == 0){
      success = true
    }
    else{
      print("Exit with non-zero code: " + exitCode + "\n")
    }
    exitcode = exitCode
    exitCode
  }

}
