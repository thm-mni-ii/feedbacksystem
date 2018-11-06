package de.thm.ii.submissioncheck

import scala.sys.process._

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpathc path of shell script
  * @param tokenc shell script parameter
  */
class BashExec(val scriptpathc: String, val tokenc: String) {

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
    * exec()
    * @return exit code
    */
  def exec() : Int = {

    output = Process("bash", Seq(scriptpath, token)).!!
    val exitCode = Process("bash", Seq(scriptpath, token)).!

    exitCode
    //return 0
  }

}
