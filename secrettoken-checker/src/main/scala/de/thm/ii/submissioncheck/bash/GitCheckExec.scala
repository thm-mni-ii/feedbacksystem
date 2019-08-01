package de.thm.ii.submissioncheck.bash

import java.io.{ByteArrayOutputStream, File}
import java.nio.file.{Files, Path, Paths}

import akka.Done
import de.thm.ii.submissioncheck.{JsonHelper, SecretTokenChecker}
import de.thm.ii.submissioncheck.SecretTokenChecker.{DATA, GIT_CHECK_ANSWER_TOPIC, GIT_TASK_ANSWER_TOPIC, LABEL_ACCEPT, LABEL_ERROR, LABEL_SUBMISSIONID,
  LABEL_TASKID, LABEL_TOKEN, ULDIR, downloadFilesToFS, sendMessage, sendTaskMessage}
import org.apache.kafka.clients.consumer.ConsumerRecord
import org.apache.kafka.clients.producer.ProducerRecord
import org.slf4j.LoggerFactory

import scala.concurrent.Future
import scala.io.Source
import scala.sys.process.{Process, ProcessLogger}
import java.net.{HttpURLConnection, URL, URLEncoder}

/**
  * Provides a service to download / clone a git uri
  *
  * @param submission_id users submission id
  * @param taskid        : submissions task id
  * @param git_url       git url
  */
class GitCheckExec(val submission_id: String, val taskid: Any, val git_url: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** save the output of our execution */
  var output: String = ""
  private val startCode = -99
  /** save the success of our execution */
  var success: Boolean = false
  /** save the exit code of our execution */
  var exitCode: Int = startCode
  private val timeout = 5000

  private val LABEL_TEST = "test"
  private val LABEL_RESULT = "result"
  private val LABEL_HEADER = "header"

  @throws(classOf[java.io.IOException])
  @throws(classOf[java.net.SocketTimeoutException])
  private def gitlabGet(url: String, token: String, connectTimeout: Int = timeout, readTimeout: Int = timeout, requestMethod: String = "GET") = {
    val connection = (new URL(url)).openConnection.asInstanceOf[HttpURLConnection]
    connection.setConnectTimeout(connectTimeout)
    connection.setReadTimeout(readTimeout)
    connection.setRequestMethod(requestMethod)
    connection.setRequestProperty("PRIVATE-TOKEN", token)
    val inputStream = connection.getInputStream
    val content = io.Source.fromInputStream(inputStream).mkString
    if (inputStream != null) inputStream.close
    content
  }

  private def runStructureTest(configFile: String, targetPath: Path) = {
    var result: List[Map[String, Any]] = List()

    val bufferedSource = Source.fromFile(configFile)
    for (line <- bufferedSource.getLines) {
      // Handle lines, with gitignore syntax
      // first trim the line
      val trimmed = line.trim
      if (trimmed.matches("!.*")) {
        // file should not be there
        val filePath = targetPath.resolve(trimmed.replace("!", ""))
        result = Map(LABEL_TEST -> trimmed, LABEL_RESULT -> !Files.exists(filePath)) :: result
      } else if (trimmed.matches("#.*")) {
        //skipp this line
      } else if (trimmed.matches("/.*")) {
        // is absolute path
        val filePath = targetPath.resolve(trimmed.replaceFirst("^/", ""))
        result = Map(LABEL_TEST -> trimmed, LABEL_RESULT -> Files.exists(filePath)) :: result
      } else {
        // file should be there
        val filePath = targetPath.resolve(trimmed)
        result = Map(LABEL_TEST -> trimmed, LABEL_RESULT -> Files.exists(filePath)) :: result
      }
    }
    bufferedSource.close
    result
  }

  /**
    * get list of every person how comitted something
    */
  private def gitGetContributorList(target_dir: String) = {
    val gitLogOutput = new ByteArrayOutputStream
    val seq = Seq("-C", target_dir, "shortlog", "-sne", "--all")

    Process("git", seq).#>(gitLogOutput).run().exitValue()

   gitLogOutput.toString.split("\n").map(entry => {
      entry.replaceFirst("^\\s*[0-9]+\\s+", "").replaceFirst("<.+>", "").trim
    }).toList
  }

  private def runMaintainerTest(docentFile: File, target_dir: String) = {
    var result: List[Map[String, Any]] = List()
    var docentResult: List[Map[String, Any]] = List()
    var docentSettingMap: Map[String, Any] = Map()
    try {
      val bufferedSource = Source.fromFile(docentFile)
      docentSettingMap = JsonHelper.jsonStrToMap(bufferedSource.mkString)
    } catch {
      case e: Exception => {
        output = "Feedbacksystem has invalid testfiles (GIT Checker). Please contact your docent."
        exitCode = 2
      }
    }
    if (exitCode == startCode || exitCode == 0) {
      try {
        val base_url = docentSettingMap("base_url")
        val API_TOKEN = docentSettingMap("API_TOKEN").toString
        val projectID = URLEncoder.encode(git_url.replaceFirst("^git.*:", "").replaceFirst(".git", ""), "UTF-8")

        val projectInfo: Map[String, Any] = JsonHelper.jsonStrToMap(gitlabGet(base_url + projectID, API_TOKEN))
        val projectMaintainer: List[Map[String, Any]] = JsonHelper.jsonStrToList(gitlabGet(base_url + projectID + "/members",
          API_TOKEN)).asInstanceOf[List[Map[String, Any]]]
        val pNames = gitGetContributorList(target_dir)

        projectMaintainer.foreach(maintainerMap => {
          val name = maintainerMap("name").asInstanceOf[String]
          if (maintainerMap("access_level").asInstanceOf[BigInt] == 40) result = Map(LABEL_TEST -> name, LABEL_RESULT -> pNames.contains(name)) :: result
        })
        val projectDeveloper = projectMaintainer.map(maintainer => {
          val name = maintainer("name").asInstanceOf[String]
          if (maintainer("access_level").asInstanceOf[BigInt] == 30) name else None
        })

        // check if docent is developer in this repo
        docentSettingMap("docents").asInstanceOf[List[String]].foreach(docent => {
          docentResult = Map(LABEL_TEST -> docent, LABEL_RESULT -> projectDeveloper.contains(docent)) :: docentResult
        })
      } catch {
        case e: java.net.SocketTimeoutException => {
          output = "Connection to GIT failed"
          exitCode = 1
        }
        case e: Exception => {
          output = "GIT Url is invalid"
          exitCode = 2
        }
      }
    }
    (result, docentResult)
  }

  /**
    * run the git clone process
    *
    * @return exitcode
    */
  def exec(): Int = {
    var dockerRelPath = ULDIR

    val targetPath = Paths.get(dockerRelPath).resolve(taskid.toString).resolve(submission_id)
    val target_dir = targetPath.toString

    val basePath = Paths.get(dockerRelPath).resolve(taskid.toString)
    val targetDirPath = Paths.get(target_dir)
    Files.createDirectories(targetDirPath)

    if (exitCode == startCode) { // no problems yet
      var seq: Seq[String] = null
      val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
      val logger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
      seq = Seq("clone", git_url, target_dir)
      exitCode = Process("git", seq).!(logger)
      output = stdoutStream.toString() + "\n" + stderrStream.toString()

      var checkresultList: List[Map[String, Any]] = List()
      var maintainerMap: List[Map[String, Any]] = List()
      var docentMap: List[Map[String, Any]] = List()
      if (exitCode == 0) {
        val configFile = new File(basePath.resolve(GitCheckExec.LABEL_STRUCTUREFILE).toString)
        val configFilePathRel = configFile.getPath
        val configFileAbsPath = configFile.getAbsolutePath
        var structureMap = runStructureTest(configFileAbsPath, targetPath)
        checkresultList = Map(LABEL_HEADER -> "Structure Check", LABEL_RESULT -> structureMap) :: checkresultList

        if (Files.exists(basePath.resolve(GitCheckExec.LABEL_CONFIGFILE))) {
          // we request to git(lab/hub) and do some activity checks
          val mapTuple = runMaintainerTest(new File(basePath.resolve(GitCheckExec.LABEL_CONFIGFILE).toString),
            targetDirPath.toAbsolutePath.toString)
          maintainerMap = mapTuple._1; docentMap = mapTuple._2;
          checkresultList = Map(LABEL_HEADER -> "Maintainer Check", LABEL_RESULT -> maintainerMap) :: checkresultList
          checkresultList = Map(LABEL_HEADER -> "Docent Check", LABEL_RESULT -> docentMap) :: checkresultList
        }

        if (exitCode == startCode || exitCode == 0) {
          var sum = 0
          structureMap.foreach(a => if (a(LABEL_RESULT).asInstanceOf[Boolean]) sum += 1)
          maintainerMap.foreach(a => if (a(LABEL_RESULT).asInstanceOf[Boolean]) sum += 1)
          docentMap.foreach(a => if (a(LABEL_RESULT).asInstanceOf[Boolean]) sum += 1)
          // If checks are passed we can send a string or a JSON String
          output = JsonHelper.listToJsonStr(checkresultList)
          if (sum == (structureMap.size + maintainerMap.size)) exitCode = 0 else exitCode = 1
        }
      }
    }
    exitCode
  }

  /**
    * get systems public key
    *
    * @return public key
    */
  def getPublicKey(): String = {
    var seq: Seq[String] = null
    val stdoutStream = new ByteArrayOutputStream
    seq = Seq(System.getenv("HOME") + "/.ssh/id_rsa.pub")

    val exitcode = Process("cat", seq).#>(stdoutStream).run().exitValue()
    stdoutStream.toString
  }
}

/**
  * static context for GitCheckExec
  */
object GitCheckExec {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** file of checker to configure it */
  var LABEL_CONFIGFILE = "config.json"
  /** file in gitignore syntax to check if seomthing is there or not */
  var LABEL_STRUCTUREFILE = "structurecheck"

  /**
    * generates the correcpoding kafka answer message
    *
    * @author Benjamin Manns
    * @param message jons string
    * @return kafka record
    */
  def sendGitCheckMessage(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](GIT_CHECK_ANSWER_TOPIC, message))

  private def sendGitTaskAnswer(message: String): Future[Done] = sendMessage(new ProducerRecord[String, String](GIT_TASK_ANSWER_TOPIC, message))

  /**
    * Kafka Callback when message for GitChecker is receiving
    *
    * @author Benjamin Manns
    * @param jsonMap a kafka record
    */
  def onTaskGitReceived(jsonMap: Map[String, Any]): Unit = {
    val urls: List[String] = jsonMap("testfile_urls").asInstanceOf[List[String]]
    val taskid: String = jsonMap(LABEL_TASKID).asInstanceOf[String]
    val jwt_token: String = jsonMap(LABEL_TOKEN).asInstanceOf[String]
    if (urls.length != 1 && urls.length != 2) {
      sendGitTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
        s"Please provide one or two files (${LABEL_STRUCTUREFILE} and ${LABEL_CONFIGFILE})", LABEL_TASKID -> taskid)))
    } else {
      val sendedFileNames = SecretTokenChecker.downloadFilesToFS(urls, jwt_token, taskid)

      // validation if sent files are useful
      if (sendedFileNames.length == 1 && !sendedFileNames.contains(LABEL_STRUCTUREFILE)) {
        sendGitTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          s"Provided file should call '${LABEL_STRUCTUREFILE}'", LABEL_TASKID -> taskid)))
      }
      else if (sendedFileNames.length == 2 && (!sendedFileNames.contains(LABEL_CONFIGFILE) || !sendedFileNames.contains(LABEL_STRUCTUREFILE))) {
        sendGitTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> false, LABEL_ERROR ->
          s"Provided files should call '${LABEL_STRUCTUREFILE}' and '${LABEL_CONFIGFILE}'", LABEL_TASKID -> taskid)))
      } else {
        sendGitTaskAnswer(JsonHelper.mapToJsonStr(Map(LABEL_ACCEPT -> true, LABEL_ERROR -> "", LABEL_TASKID -> taskid)))
      }
    }
  }

  /**
    * Kafka Callback when message for GitChecker is receiving
    *
    * @author Benjamin Manns
    * @param jsonMap a kafka record
    */
  def onGitReceived(jsonMap: Map[String, Any]): Unit = {
    logger.warn("GIT Submission Received")
    val jwt_token = jsonMap(LABEL_TOKEN).asInstanceOf[String]
    val task_id = jsonMap(LABEL_TASKID)
    val git_url = jsonMap(DATA).asInstanceOf[String]
    val sumission_id = jsonMap(LABEL_SUBMISSIONID).asInstanceOf[String]
    try {
      val gitChecker = new GitCheckExec(sumission_id, task_id, git_url)
      val exitcode = gitChecker.exec()
      val passed = if (exitcode == 0) 1 else 0

      sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(
        "passed" -> passed.toString,
        "exitcode" -> exitcode.toString,
        LABEL_TASKID -> task_id.toString,
        LABEL_SUBMISSIONID -> sumission_id,
        "public_key" -> gitChecker.getPublicKey,
        DATA -> gitChecker.output
      )))
    } catch {
      case e: Exception => {
        sendGitCheckMessage(JsonHelper.mapToJsonStr(Map(
          "passed" -> "0",
          "exitcode" -> "42",
          LABEL_TASKID -> task_id.toString,
          LABEL_SUBMISSIONID -> sumission_id,
          DATA -> e.getMessage
        )))
      }
    }
  }
}
