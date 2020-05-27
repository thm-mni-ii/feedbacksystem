package de.thm.ii.fbs.checker

import java.io.File
import java.nio.file.{Path, Paths}
import de.thm.ii.fbs.{FileOperations, ResultType}
import de.thm.ii.fbs.SecretTokenChecker.{ULDIR, logger}

import scala.sys.process.{Process, ProcessLogger}

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class NodeCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "node"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map("nodetest.zip" -> true)
  /** define allowed submission types - to be overwritten */
  override val allowedSubmissionTypes: List[String] = List("file", "extern")

  /** label for the nodetest root folder*/
  val LABEL_NODETEST = "nodetest"

  /**
    * Figure out where the test / npm path is, take the best folder inside the provided zip. If it can not be found,
    * send an error to the user that he should provide a better zip file
    *
    * @param rootPath where to start looking for the node folder
    * @return the path where a npm structure has been found
    */
  def getFullNPMPath(rootPath: String): String = {
    val d = new File(rootPath)
    val fileList = if (d.exists && d.isDirectory) {
      d.listFiles.filter(!_.toString.contains("__MACOSX")).toList
    } else {
      List[File]()
    }

    if (fileList.filter(f => {f.isFile && f.toString.contains("package.json")}).nonEmpty) {
      rootPath
    } else if (fileList.filter(_.isDirectory).nonEmpty) {
      getFullNPMPath(fileList.filter(_.isDirectory).head.toPath.toString)
    } else {
      throw new CheckerException("Provided config zip file is not usefull. There are multiple main folders, " +
        "if you provide a nested folder please avoid multiple root folders")
    }
  }

  /**
    * Figure out where the main submission path is (contains just files), take the best folder inside the provided zip.
    * If it can not be found, send an error to the user that he should provide a better zip file / folder
    *
    * @param rootPath where to start looking for the node folder
    * @return the path where a npm structure has been found
    */
  def getFullSubPath(rootPath: String): String = {
    val d = new File(rootPath)
    val fileList = if (d.exists && d.isDirectory) {
      d.listFiles.filter(!_.toString.contains("__MACOSX")).toList
    } else {
      List[File]()
    }

    if (fileList.filter(f => {f.isFile}).nonEmpty) {
      rootPath
    } else if (fileList.filter(_.isDirectory).nonEmpty) {
      getFullSubPath(fileList.filter(_.isDirectory).head.toPath.toString)
    } else {
      throw new CheckerException("Provided submission zip file or git folder is not usefull. There are multiple main folders, " +
        "if you provide a nested folder please avoid multiple root folders")
    }
  }

  private def copyNodeConfigToTmp(orgpath: Path) = {
    val tmpdir = getTempFile("nodetest")
    FileOperations.copy(orgpath.toFile, tmpdir.toFile)
    tmpdir
  }

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
    logger.info("Execute Node Checker")
    // if use_extern it is the same path
    val nodeExecutionPath = subBasePath.resolve("unzip").toAbsolutePath; nodeExecutionPath.toFile.mkdir()
    // TODO somehow export this execution path to copy those files where they belong (dont know if necessary)
    if (!use_extern) unzip(subFilename.toAbsolutePath.toString, nodeExecutionPath)

    val nodeDockerImage = "thmmniii/nodeenv:dev-latest" // "thmmniii/node"
    val interpreter = "bash"; val action = "/usr/src/script/run.sh"
    var seq: Seq[String] = null; val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val infoArgument = if (isInfo) "info" else ""
    val nodeTestOrg = Paths.get(ULDIR).resolve(taskid.toString).resolve(checkernameExtened).resolve(LABEL_NODETEST)
    var nodeTestPath = getFullNPMPath(copyNodeConfigToTmp(nodeTestOrg).toString)
    val (insideDockerNodeTestPath, insideDockerNodeResPath) = ("/usr/src/app", "/usr/src/results")
    var relatedSubPath = if (use_extern) subBasePath.toString else getFullSubPath(subBasePath.resolve("unzip").toString)
    val resultsPath = subBasePath.resolve("results")
    resultsPath.toFile.mkdirs()

    if (compile_production) {
      nodeTestPath = getCorespondigHOSTTempDir(Paths.get(nodeTestPath)).toString
      relatedSubPath = getCorespondigHOSTTempDir(Paths.get(relatedSubPath)).toString
    }

    val resultsPathAdapt = (if (compile_production) getCorespondigHOSTTempDir(resultsPath) else resultsPath).toString

    seq = Seq("run", "--rm", __option_v, nodeTestPath + __colon + insideDockerNodeTestPath, __option_v,
        relatedSubPath + __colon + insideDockerNodeTestPath + __slash + "src", __option_v, resultsPathAdapt + __colon + insideDockerNodeResPath,
        nodeDockerImage, interpreter, action, infoArgument)
    logger.warning(seq.toString())
    val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
    val procLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
    val exitcode = Process("docker", seq).!(procLogger)
    val resultFile = new File(resultsPath.resolve("test.results.json").toString)
    val output = if (resultFile.isFile) {
      scala.io.Source.fromFile(resultsPath.resolve("test.results.json").toString).mkString
    } else {
      stdoutStream.toString() + "\n" + stderrStream.toString()
    }
    val success = (exitcode == 0)
    (success, output, exitcode, if (success) ResultType.JSON else ResultType.STRING)
  }

  /**
    * perform some extra checks on task receive if needed, exceptions will be catched in callee
    * @param taskid submitted task id
    * @param sentFileNames list of sent files
    */
  override def taskReceiveExtendedCheck(taskid: Int, sentFileNames: List[String]): Unit = {
    val nodeTestPath = Paths.get(ULDIR).resolve(taskid.toString).resolve(checkernameExtened).resolve(LABEL_NODETEST)

    val nodeTestFile = nodeTestPath.toFile
    if (nodeTestFile.exists()) deleteDirectory(nodeTestFile)

    unzip(Paths.get(ULDIR).resolve(taskid.toString).resolve(checkernameExtened).resolve(sentFileNames.head).toAbsolutePath.toString, nodeTestPath)
  }
}

