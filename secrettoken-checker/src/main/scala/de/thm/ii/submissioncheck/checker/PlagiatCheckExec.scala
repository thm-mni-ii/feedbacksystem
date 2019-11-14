package de.thm.ii.submissioncheck.checker
import java.io.{ByteArrayOutputStream, File}
import java.nio.file.Paths

import de.thm.ii.submissioncheck.JsonHelper
import de.thm.ii.submissioncheck.SecretTokenChecker.{LABEL_ACCEPT, LABEL_ERROR, LABEL_TASKID, ULDIR, logger, sendMessage}
import de.thm.ii.submissioncheck.security.Secrets
import de.thm.ii.submissioncheck.services.FileOperations
import org.apache.kafka.clients.producer.ProducerRecord

import scala.sys.process.{Process, ProcessLogger}

/**
  * Hello World Checker Class is an example
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class PlagiatCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "plagiarism"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: List[String] = List("")

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
    // A submission a user does
    var plagiatExecPath = Paths.get(ULDIR).resolve(taskid).resolve(submissionid).toAbsolutePath.toString
    var output = s"The ${checkername} checker results: ${true}"
    var exitcode = -1
    val otherSubmissionsNotFromUser = Paths.get(ULDIR).resolve(taskid).resolve("PLAGIAT_CHECK").resolve(Secrets.getSHAStringFromNow())
    otherSubmissionsNotFromUser.toFile.mkdirs()
    try {
     val usersSubmissionIDs: List[String] = jsonMap("plagiatinfo").asInstanceOf[Map[String, Any]]("usersubmission").asInstanceOf[List[Map[String, Any]]]
       .map(v => v("submission_id").toString)
      val dirsToCopy = Paths.get(ULDIR).resolve(taskid).toFile.listFiles.filter(f => f.isDirectory)
        .filter(f => (f.getName forall Character.isDigit) && !usersSubmissionIDs.contains(f.getName)).toList

      dirsToCopy.foreach(dir => {
        FileOperations.copy(dir, otherSubmissionsNotFromUser.resolve(dir.getName).toFile)
      })
      //  var (baseFilePath, configfiles) = loadCheckerConfig(taskid)
      val dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
      // TODO compile production

      var seq: Seq[String] = null
      val stdoutStream = new StringBuilder; val stderrStream = new StringBuilder
      val logger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))

      val bashDockerImage = System.getenv("BASH_DOCKER")
      var oldPath = otherSubmissionsNotFromUser.toAbsolutePath.toString
      if (compile_production) {
        oldPath = dockerRelPath + __slash + oldPath.replace(ULDIR, "")
        plagiatExecPath = dockerRelPath + __slash + plagiatExecPath.toString.replace(ULDIR, "")
      }
      // That's how we use sim (https://manpages.ubuntu.com/manpages/trusty/man1/similarity-tester.1.html)
      seq = Seq("run", "--rm", __option_v, s"$plagiatExecPath:/upload-dir/plagiat/new", __option_v, s"${oldPath}:/upload-dir/plagiat/old", bashDockerImage,
       "bash", "/opt/sim/run_check.sh")

      exitcode = Process("docker", seq).!(logger)
      val plagiatSuccess = processSIMOutput(stdoutStream.toString() + "\n" + stderrStream.toString())._1
      sendPlagiatAnswer(submissionid, plagiatSuccess, taskid)
    } catch {
      case e: Exception => output = e.getMessage
    }

    FileOperations.rmdir(otherSubmissionsNotFromUser.toFile)

    // Always return TRUE, not to inform the user about this plagirism, but to give feedback, all checks are done
    // feedback musst be saved in a other possibility
    (true, output, exitcode)
  }

  private def sendPlagiatAnswer(subid: Any, plagiatOK: Boolean, taskid: Any) = {
    val topic = "plagiarismchecker_answer"
    val msg = JsonHelper.mapToJsonStr(Map("success" -> true, LABEL_TASKID -> taskid.toString, "submissionlist" -> List(Map(
      subid.toString -> plagiatOK
    )), LABEL_ACCEPT -> false))
    logger.warning(msg)
    sendMessage(new ProducerRecord[String, String](topic, msg))
  }

  private def processSIMOutput(output: String): (Boolean, List[String]) = {
    val pattern = "(consists for (\\d+) % of)".r

    val found = pattern.findFirstIn(output)
    if (found.isEmpty) {
      (true, List())
    } else {
      (false, pattern.findAllMatchIn(output).map(m => m.group(2).toString).toList)
    }
  }
}

