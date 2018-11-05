package de.thm.ii.submissioncheck

import scala.sys.process._

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpathc
  * @param tokenc
  */
class BashExec(val scriptpathc: String, val tokenc: String) {

  var scriptpath = scriptpathc
  var token = tokenc
  var output = ""


  def exec() : Int = {

    output = Process("bash", Seq(scriptpath, token)).!!
    val exitCode = Process("bash", Seq(scriptpath, token)).!

    return exitCode
    //return 0
  }


}
