package de.thm.ii.submissioncheck

import scala.sys.process._

/**
  * Class for executing Bourne Shell scripts
  *
  * @author Vlad Sokyrskyy
  *
  * @param scriptpathc
  * @param tokenc
  */
class ShExec(val scriptpathc: String, val tokenc: String) {

  var scriptpath = scriptpathc
  var token = tokenc
  var output = ""

  def exec() : Int = {

    output = Process("sh", Seq( scriptpath, token)).!!
    val exitCode = Process("sh", Seq(scriptpath, token)).!

    return exitCode
    //return 0
  }
}
