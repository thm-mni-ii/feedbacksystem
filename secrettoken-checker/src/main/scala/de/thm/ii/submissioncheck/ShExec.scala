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
    * Class field scriptpath
    */
  var scriptpath = scriptpathc

  /**
    * Class field token
    */
  var token = tokenc

  /**
    * Class field script output
    */
  var output = ""

  /**
    * Run the script with arguments
    * @return exit code
    */
  def exec() : Int = {

    output = Process("sh", Seq( scriptpath, token)).!!
    val exitCode = Process("sh", Seq(scriptpath, token)).!

    exitCode
    //return 0
  }
}
