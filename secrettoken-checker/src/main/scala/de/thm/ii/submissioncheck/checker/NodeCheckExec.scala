package de.thm.ii.submissioncheck.checker

import java.io.{File}
import java.nio.file.{FileAlreadyExistsException, Files, Path, Paths}
import de.thm.ii.submissioncheck.SecretTokenChecker.{ULDIR, downloadSubmittedFileToFS, logger, saveStringToFile,
  sendMessage}
import scala.sys.process.{Process, ProcessLogger}

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class NodeCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "node"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: List[String] = List("nodetest.zip")
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

  /**
   * perform a check of request, will be executed after processing the kafka message
   * @param taskid submissions task id
   * @param submissionid submitted submission id
   * @param submittedFilePath path of submitted file (if zip or something, it is also a "file"
   * @param isInfo execute info procedure for given task
   * @param use_extern include an existing file, from previous checks
   * @return check succeeded, output string, exitcode
   */
  override def exec(taskid: String, submissionid: String, submittedFilePath: String, isInfo: Boolean, use_extern: Boolean): (Boolean, String, Int) = {
    logger.info("Execute Node Checker")
    // if use_extern it is the same path
    val nodeExecutionPath = Paths.get(ULDIR).resolve(taskid).resolve(submissionid).resolve("unzip").toAbsolutePath
    if (!use_extern) unzip(submittedFilePath, nodeExecutionPath)

    val nodeDockerImage = "thmmniii/nodeenv:dev-latest" // "thmmniii/node"
    val interpreter = "bash"; val action = "/usr/src/script/run.sh"
    var seq: Seq[String] = null; val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    val infoArgument = if (isInfo) "info" else ""
    val nodeTestPath = getFullNPMPath(Paths.get(ULDIR).resolve(taskid.toString).resolve(LABEL_NODETEST).toString)
    val insideDockerNodeTestPath = "/usr/src/app"
    val insideDockerNodeResPath = "/usr/src/results"
    val subPath = Paths.get(ULDIR).resolve(taskid.toString).resolve(submissionid)
    val relatedSubPath = if (use_extern) subPath.toString else getFullSubPath(subPath.resolve("unzip").toString)
    val resultsPath = subPath.resolve("results")

    // prepare a folder to put the results in (submission specific)
    try {
      Files.createDirectories(resultsPath)
    }
    catch {
      case e: FileAlreadyExistsException => { }
    }
    if (compile_production){
      seq = Seq("run", "--rm", __option_v, dockerRelPath + __slash + nodeTestPath.toString.replace(ULDIR, "") + __colon + insideDockerNodeTestPath, __option_v,
        dockerRelPath + __slash + relatedSubPath.replace(ULDIR, "") + __colon + insideDockerNodeTestPath + __slash + "src", __option_v,
        dockerRelPath + __slash + resultsPath.toString.replace(ULDIR, "") + __colon + insideDockerNodeResPath,
        nodeDockerImage, interpreter, action, infoArgument)
    } else {
      val absSubPath = Paths.get(relatedSubPath).toAbsolutePath.toString
      val absNodeTestPath = Paths.get(nodeTestPath).toAbsolutePath.toString
      seq = Seq("run", "--rm", __option_v, absNodeTestPath + __colon + insideDockerNodeTestPath, __option_v, absSubPath + __colon
        + insideDockerNodeTestPath + __slash + "src", __option_v,
        resultsPath.toAbsolutePath.toString + __colon +  insideDockerNodeResPath, nodeDockerImage, interpreter, action, infoArgument)
    }
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
    (success, output, exitcode)
  }

  /**
    * perform some extra checks on task receive if needed, exceptions will be catched in callee
    * @param taskid submitted task id
    * @param sentFileNames list of sent files
    */
  override def taskReceiveExtendedCheck(taskid: Int, sentFileNames: List[String]): Unit = {
    val nodeTestPath = Paths.get(ULDIR).resolve(taskid.toString).resolve(LABEL_NODETEST)

    val nodeTestFile = new File(nodeTestPath.toAbsolutePath.toString)
    if (nodeTestFile.exists()) deleteDirectory(nodeTestFile)

    unzip(Paths.get(ULDIR).resolve(taskid.toString).resolve(sentFileNames.head).toAbsolutePath.toString, nodeTestPath)
  }
}

