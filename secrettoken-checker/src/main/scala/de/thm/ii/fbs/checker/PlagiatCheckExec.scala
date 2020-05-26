package de.thm.ii.fbs.checker

import java.nio.file.{Path, Paths}
import de.thm.ii.fbs.SecretTokenChecker.{LABEL_TASKID, ULDIR, logger}
import de.thm.ii.fbs.security.Secrets
import de.thm.ii.fbs.FileOperations
import de.thm.ii.fbs.{JsonHelper, ResultType}
import scala.collection.mutable.ListBuffer
import scala.sys.process.{Process, ProcessLogger}

/**
  * Hello World Checker Class is an example
  *
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class PlagiatCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "plagiarismchecker" */
  override val checkername = "plagiarism"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map("config.json" -> true)
  /** limit where a similarity between files is a plagism */
  var similarity_limit = 2*10
  private val LABEL_USER_ID = "userid"

  private def submissionIdsOfUser(jsonMap: Map[String, Any], userid: Int) = {
    val token = jsonMap("jwt_token").asInstanceOf[String]
    val taskid = jsonMap(LABEL_TASKID).toString.toInt
    val (code, msg, map) = apiCall(s"""${jsonMap("api_url")}/tasks/${taskid}/submissions/${userid}""", token, "GET")
    map.asInstanceOf[List[Map[String, Any]]].map(v => v("submission_id").toString)
  }

  private def createFoldersForEachUser(jsonMap: Map[String, Any]) = {
    val token = jsonMap("jwt_token").asInstanceOf[String]
    val (code, msg, map) = apiCall(s"${jsonMap("api_url")}/courses/${jsonMap("courseid")}/submissions", token, "GET")
    val taskid = jsonMap(LABEL_TASKID).toString.toInt
    val subUser = jsonMap(LABEL_USER_ID).toString.toInt // some

    val basepath: Path = Paths.get(ULDIR).resolve(taskid.toString).resolve("PLAGIAT_CHECK").resolve(Secrets.getSHAStringFromNow())
    basepath.toFile.mkdirs()

    val availableSubmissionFolders = Paths.get(ULDIR).resolve(taskid.toString).toFile.listFiles
      .filter(f => f.isDirectory)
      .filter(f => (f.getName forall Character.isDigit))
      .toList

    var pathesOfUsers = new ListBuffer[(Path, String)]()
    if (code < 400) {
      for (userMap <- map.asInstanceOf[List[Map[String, Any]]]) {
        val user = userMap("user_id").toString.toInt
        if (subUser != user) {
          val subIds = submissionIdsOfUser(jsonMap, user)
          availableSubmissionFolders.filter(f => subIds.contains(f.getName)).foreach(dir => {
            val path = basepath.resolve(user.toString).resolve(dir.getName)
            pathesOfUsers += ((path, dir.getName))
            FileOperations.copy(dir, path.toFile)
          })
        }
      }
    }
    (pathesOfUsers.toList, basepath)
  }

  private def loadSIMConfig(taskid: String) = {
    val (baseFilePath, configfiles) = loadCheckerConfig(taskid)

    val checkerConfig = scala.io.Source.fromFile(configfiles(0).toString).mkString
    val plagiatConfig = JsonHelper.jsonStrToAny(checkerConfig).asInstanceOf[Map[String, Any]]
    plagiatConfig("similarity").toString.toInt
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
    // A submission a user does
    var plagiatExecPath = subBasePath.toAbsolutePath.toString
    var output = s"The ${checkername} checker results: ${true}"; var exitcode = -1
    similarity_limit = loadSIMConfig(taskid); val userid = jsonMap(LABEL_USER_ID).toString.toInt
    try {
      val (pathsToCompare, basepath) = createFoldersForEachUser(jsonMap)
      val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")

      val stdoutStream = new StringBuilder;
      val stderrStream = new StringBuilder
      val prozessLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
      val bashDockerImage = System.getenv("BASH_DOCKER")
      var summerizedPassed = true

      val tmpDir = getTempFile("plagiatchecker_" + userid.toString)
      FileOperations.copy(subBasePath.toFile, tmpDir.toFile)
      for (subInfo <- pathsToCompare) {
        val otherSubmissionsNotFromUser = subInfo._1

        var oldPath = otherSubmissionsNotFromUser.toAbsolutePath.toString
        if (compile_production) {
          oldPath = dockerRelPath + __slash + oldPath.replace(ULDIR, "")
          plagiatExecPath = dockerRelPath + __slash + plagiatExecPath.replace(ULDIR, "")
        }
        // That's how we use sim (https://manpages.ubuntu.com/manpages/trusty/man1/similarity-tester.1.html)
        val seq = Seq("run", "--rm", __option_v, s"$plagiatExecPath:/upload-dir/plagiat/new", __option_v, s"${oldPath}:/upload-dir/plagiat/old",
          bashDockerImage, "bash", "/opt/sim/run_check.sh")

        exitcode = Process("docker", seq).!(prozessLogger)
        val process = processSIMOutput(stdoutStream.toString() + "\n" + stderrStream.toString())
        summerizedPassed = (summerizedPassed && process._1)
        logger.warning(process._2.map(num => num.toString).reduce((a, b) => s"${a}, ${b}"))
        // do not sent to the single user who has the old path (the original submission)
        if (!process._1) FileOperations.copy(Paths.get(oldPath).toFile, tmpDir.toFile) // add this old path to a zip, where docent can compare himself
      }
      sendPlagiatAnswer(submissionid, summerizedPassed, taskid) // send detection on current main user, and then provide a downloadable zip
      sendPlagiatZip(jsonMap, userid, subBasePath, tmpDir, taskid)
      FileOperations.rmdir(basepath.toFile)
    } catch {
      case e: Exception => output = e.toString
    }

    // Always return TRUE, not to inform the user about this plagirism, but to give feedback, all checks are done feedback is saved in another way
    (true, output, exitcode, ResultType.STRING)
  }

  private def sendPlagiatZip(jsonMap: Map[String, Any], userid: Int, subBasePath: Path, tmpDir: Path, taskid: String) = {
    val filename = s"plagiat_combined_hits_user_${userid}_task_${jsonMap("taskid")}.zip"
    val zip = subBasePath.resolve(filename)

    // make and send zip File
    FileOperations.zip(zip, tmpDir.toString)
    additionalMessagetoWS("plagiatPackedZip", JsonHelper.mapToJsonStr(Map("filename" -> filename, LABEL_TASKID -> taskid,
      LABEL_USER_ID -> userid)), zip.toFile)

    // tidy up the packed zip
    FileOperations.rmdir(zip.toFile)
  }

  private def sendPlagiatAnswer(subid: Any, plagiatOK: Boolean, taskid: Any) = {
    val topic = "plagiarismcheckerAnswer"

    val msg = JsonHelper.mapToJsonStr(Map(LABEL_TASKID -> taskid.toString, "submissionlist" -> List(Map(subid -> plagiatOK))))
    additionalMessagetoWS(topic, msg)
  }

  private def processSIMOutput(output: String): (Boolean, List[Int]) = {
    val pattern = "(consists for (\\d+) % of)".r
    logger.warning(output)
    val found = pattern.findFirstIn(output)
    if (found.isEmpty) {
      (true, List(0))
    } else {
      val similarities = pattern.findAllMatchIn(output)
        .map(m => m.group(2).toString.toInt)
        .filter(sim => sim >= similarity_limit)
        .toList
      val passed = similarities.isEmpty
      (passed, similarities)
    }
  }
}
