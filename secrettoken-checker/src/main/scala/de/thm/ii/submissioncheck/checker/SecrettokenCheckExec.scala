package de.thm.ii.submissioncheck.checker
import java.io.{File}
import java.nio.file.{FileAlreadyExistsException, Files, Path, Paths}
import de.thm.ii.submissioncheck.SecretTokenChecker.{ULDIR, downloadSubmittedFileToFS, logger, saveStringToFile,
  sendMessage}
import scala.sys.process.{Process, ProcessLogger}

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
    * @param submittedFilePath path of submitted file (if zip or something, it is also a "file"
    * @param isInfo execute info procedure for given task
    * @param use_extern include an existing file, from previous checks
    * @param jsonMap complete submission payload
    * @return check succeeded, output string, exitcode
    */
  override def exec(taskid: String, submissionid: String, submittedFilePath: String, isInfo: Boolean, use_extern: Boolean, jsonMap: Map[String, Any]):
  (Boolean, String, Int) = {
    val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val (basepath, checkerfiles) = loadCheckerConfig(taskid)

    val scriptFile = checkerfiles(0).toFile
    val scriptpath = scriptFile.getPath
    var interpreter = "bash"
    val scriptContent = scala.io.Source.fromFile(scriptpath).mkString

    if (scriptContent.split("\n").head.matches("#!.*php.*")) interpreter = "php"

    val absPath = scriptFile.getAbsolutePath
    val testfileFile = new File(basepath.resolve("testfile").toString)
    val testfilePathRel = testfileFile.getPath
    val testfilePath = testfileFile.getAbsolutePath
    val testfileEnvParam = if (testfileFile.exists() && testfileFile.isFile) { testfilePath } else ""
    val bashDockerImage = System.getenv("BASH_DOCKER")
    var seq: Seq[String] = null

    val infoArgument = if (isInfo) "info" else ""
    val name = jsonMap("username").asInstanceOf[String]
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

    val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
    val procLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
    var exitCode = Process("docker", seq).!(procLogger)
    val output = stdoutStream.toString() //+ "\n" + stderrStream.toString()
    if (stderrStream.toString.length > 0 && exitCode == 0) exitCode = 2*21
    val success = exitCode == 0

    (success, output, exitCode)
  }
}
