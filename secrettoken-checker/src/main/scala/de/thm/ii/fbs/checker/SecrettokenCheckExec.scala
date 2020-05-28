package de.thm.ii.fbs.checker

import java.nio.file.Path
import de.thm.ii.fbs.ResultType
import de.thm.ii.fbs.SecretTokenChecker.ULDIR
import scala.sys.process.{Process, ProcessLogger}
import de.thm.ii.fbs.SecretTokenChecker.logger
/**
  * Check submissions wich can handle php and bash tests
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class SecrettokenCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "secrettokenchecker" */
  override val checkername = "secrettoken"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map("scriptfile" -> true, "testfile" -> false)

  /** define allowed submission types - to be overwritten */
  override val allowedSubmissionTypes: List[String] = List("file", "extern", "data")

  /**
    * perform a check of request, will be executed after processing the kafka message
    * @param taskid submissions task id
    * @param submissionid submitted submission id
    * @param subBasePath, subFileame path of folder, where submitted file is in
    * @param subFilename path of submitted file (if zip or something, it is also a "file")
    * @param isInfo execute info procedure for given task
    * @param use_extern include an existing file, from previous checks
    * @param jsonMap complete submission payload
    * @return check succeeded, output string, exitcode
    */
  override def exec(taskid: String, submissionid: String, subBasePath: Path, subFilename: Path, isInfo: Boolean, use_extern: Boolean,
                    jsonMap: Map[String, Any]): (Boolean, String, Int, String) = {
    val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val (basepath, checkerfiles) = loadCheckerConfig(taskid)
    logger.warning("Processing files: " + basepath + " " + checkerfiles)

    val scriptFile = checkerfiles(0).toFile
    val scriptpath = scriptFile.getPath
    var interpreter = "bash"
    val scriptContent = scala.io.Source.fromFile(scriptpath).mkString

    if (scriptContent.split("\n").head.matches("#!.*php.*")) interpreter = "php"

    val absPath = scriptFile.getAbsolutePath
    val testfileFile = basepath.resolve("testfile").toFile

    val bashDockerImage = System.getenv("BASH_DOCKER")
    var seq: Seq[String] = null
    val submittedFilePath = (if (compile_production) getCorespondigHOSTTempDir(subFilename) else subFilename).toString

    val infoArgument = if (isInfo) "info" else ""
    val name = jsonMap("username").asInstanceOf[String]

    val mountingOrgScriptPath = if (compile_production) {
      dockerRelPath + __slash + scriptpath.replace(ULDIR, "")
    } else {
      absPath
    }
    val mountingTestfilePath = if (compile_production) {
      dockerRelPath + __slash + testfileFile.toPath.toAbsolutePath.toString.replace(ULDIR, "")
    } else {
      testfileFile.toPath.toAbsolutePath.toString
    }

    val testfileEnvParam = if (testfileFile.exists() && testfileFile.isFile) { mountingTestfilePath } else ""

    seq = Seq("run", "--rm", __option_v, mountingOrgScriptPath + ":" + absPath, __option_v, mountingTestfilePath + ":" + mountingTestfilePath,
      __option_v, submittedFilePath + __colon + submittedFilePath, "--env", "TESTFILE_PATH=" + testfileEnvParam, bashDockerImage, interpreter,
      absPath, name, submittedFilePath, infoArgument)

    logger.warning("Using arguments: " + seq)

    val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
    val procLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
    var exitCode = Process("docker", seq).!(procLogger)
    val output = stdoutStream.toString() + "\n" + stderrStream.toString()
    if (stderrStream.toString.length > 0 && exitCode == 0) exitCode = 2*21
    val success = exitCode == 0

    (success, output, exitCode, ResultType.STRING)
  }
}
