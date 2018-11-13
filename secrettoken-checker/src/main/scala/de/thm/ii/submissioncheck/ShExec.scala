package de.thm.ii.submissioncheck

import scala.sys.process._

/**
  * Class for executing Bourne Shell scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpathc path of shell script
  * @param tokenc shell script parameter
  */
class ShExec(val scriptpathc: String, val tokenc: String) {
  /**
    * Class instance scriptpath
    */
  var scriptpath = scriptpathc

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
    if(exitCode == 0){
      success = true
    }
    else {
      print("Exit with non-zero code: " + exitCode + "\n")
    }
    exitcode = exitCode
    exitCode
    //return 0
  }
}
