package de.thm.ii.submissioncheck.bash

import java.io._
import java.nio.file.{Path, Paths}
import de.thm.ii.submissioncheck.SecretTokenChecker.ULDIR
import org.slf4j.LoggerFactory

import scala.sys.process.Process

/**
  * Class for executing Bash scripts
  *
  * @author Vlad Sokyrskyy
  * @param taskid of submitted task
  * @param name username parameter
  * @param submittedFilePath users submission saved as file
  * @param compile_production run different docker command if inside docker or outside
  * @param isInfo calculates a info message
  */
class BashExec(val taskid: String, val name: String, val submittedFilePath: String, val compile_production: Boolean, isInfo: Boolean) {
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
  private val __slash = "/"
  private val __colon = ":"
  /**
    * exec()
    *
    * @return exit code
    */
  def exec(): Int = {
    val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val baseFilePath = Paths.get(ULDIR).resolve(taskid)
    val scriptFile = new File(baseFilePath.resolve("scriptfile").toString)
    val scriptpath = scriptFile.getPath
    var interpreter = "bash"
    val scriptContent = scala.io.Source.fromFile(scriptpath).mkString

    if (scriptContent.split("\n").head.matches("#!.*php.*")) {
      interpreter = "php"
    }
    val absPath = scriptFile.getAbsolutePath

    val testfileFile = new File(baseFilePath.resolve("testfile").toString)
    val testfilePathRel = testfileFile.getPath
    val testfilePath = testfileFile.getAbsolutePath
    val testfileEnvParam = if (testfileFile.exists() && testfileFile.isFile) { testfilePath } else ""

    val stdoutStream = new ByteArrayOutputStream
    val bashDockerImage = "thmmniii/bash" // "bash:4.4"
    var seq: Seq[String] = null

    val infoArgument = if (isInfo) { "info"} else ""

    if (compile_production) {
      seq = Seq("run", "--rm", __option_v, dockerRelPath + __slash + scriptpath.replace(ULDIR, "") + __colon + scriptpath,
        __option_v, dockerRelPath + __slash + testfilePathRel.replace(ULDIR, "") + __colon + __slash + testfilePath, __option_v,
        dockerRelPath + __slash + submittedFilePath.replace(ULDIR, "") + __colon + submittedFilePath, "--env",
        "TESTFILE_PATH=" + testfileEnvParam, bashDockerImage, interpreter, scriptpath, name, submittedFilePath, infoArgument)
      // "-c", "'ls -al " + scriptpath + "; cat " + scriptpath + "'")
    } else {
      seq = Seq("run", "--rm", __option_v, absPath + ":/" + absPath, __option_v, testfilePath + ":/" + testfilePath,
        __option_v, submittedFilePath + __colon + submittedFilePath, "--env", "TESTFILE_PATH=" + testfileEnvParam, bashDockerImage, interpreter,
        "/" + absPath, name, submittedFilePath, infoArgument)
    }
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
