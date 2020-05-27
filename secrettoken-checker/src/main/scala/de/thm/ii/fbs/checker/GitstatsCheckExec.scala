package de.thm.ii.fbs.checker

import java.io.{BufferedInputStream, FileInputStream}
import java.nio.file.{Path, Paths}
import java.util.Base64

import de.thm.ii.fbs.ResultType
import de.thm.ii.fbs.SecretTokenChecker.logger
import de.thm.ii.fbs.security.Secrets

import scala.collection.JavaConverters._
import scala.sys.process.{Process, ProcessLogger}

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  *
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class GitstatsCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "gitstats"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map()
  /** define allowed submission types - to be overwritten */
  override val allowedSubmissionTypes: List[String] = List("file", "data", "extern", "resubmit")
  private val LABEL_TEXT = "text"
  // todo later, we need to complete rewrite the core again... private val availableStatTypes = List("hour_of_day", "lines_of_code")

  private def toBool(data: String): Boolean = data.trim == "true"

  private def runSeq(cmd: String, options: Seq[String]) = {
    val stdoutStream = new StringBuilder;
    val stderrStream = new StringBuilder
    val logger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))
    val exitCode = Process(cmd, options).!(logger)
    val output = stdoutStream.toString() + "\n" + stderrStream.toString()
    (output, exitCode)
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
    logger.info("Execute Gitstats Checker")
    // read csv
    var (baseFilePath, configfiles) = loadCheckerConfig(taskid)

    var passed = true

    /*val output = if (isInfo) {
      var generatedAnswer: List[Map[String, Any]] = List()
      for ((answer, i) <- availableStatTypes.zipWithIndex) {
        generatedAnswer = Map(LABEL_TEXT -> answer, "id" -> i) :: generatedAnswer
      }
      JsonHelper.listToJsonStr(generatedAnswer)
    } else {*/
    //val userSolution = JsonHelper.jsonStrToMap(scala.io.Source.fromFile(submittedFilePath).mkString).asInstanceOf[Map[String, Boolean]]
    //val selectedKeyOpt = userSolution.keys.filter(key => userSolution(key)).headOption
    val selectedStatMethod = "lines_of_code_by_author" // TODO load by user, needs to restructure whole core
    //= if (selectedKeyOpt.isDefined) availableStatTypes(selectedKeyOpt.head.toInt) else availableStatTypes.head

    // run selectedStatMethod
    val gitMainPath = subBasePath

    val gitStatOut = Paths.get(System.getProperty("java.io.tmpdir")).resolve(s"gitstatsoutput_${Secrets.getSHAStringFromNow()}")
    gitStatOut.toFile.mkdir() // tidy up and generate needed folder

    // we need to check if this folder is a git directory, otherwise we deny such operations
    if (!gitMainPath.resolve(".git").toFile.exists()) {
      (false, "Folder is no git repo, gitstats can not executed", 42, ResultType.STRING)
    } else {
      val seq = Seq(gitMainPath.toAbsolutePath.toString, gitStatOut.toAbsolutePath.toString)
      var (output, exitcode) = runSeq("gitstats", seq)
      passed = (exitcode == 0)

      logger.warning(gitStatOut.toString)
      logger.warning(output)

      val bis = new BufferedInputStream(new FileInputStream(gitStatOut.resolve(selectedStatMethod + ".png").toAbsolutePath.toString))
      val bArray: Array[Byte] = LazyList.continually(bis.read).takeWhile(_ != -1).map(_.toByte).toArray
      output = Base64.getEncoder.encodeToString(bArray)

      (passed, output, if (passed) 0 else 1, ResultType.BASE64)
    }
  }
}

