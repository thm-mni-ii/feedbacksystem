package de.thm.ii.fbs.checker

import java.nio.file.Path
import de.thm.ii.fbs.ResultType
import de.thm.ii.fbs.SecretTokenChecker.logger
/**
  * Hello World Checker Class is an example
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class HelloworldCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "helloworld"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map("configfile"->true)

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
    var (baseFilePath, configfiles) = loadCheckerConfig(taskid)
    val docentsContent = scala.io.Source.fromFile(configfiles(0).toString).mkString
    val usersContent = scala.io.Source.fromFile(subFilename.toFile).mkString
    logger.warning(usersContent)
    val success = (docentsContent.trim == usersContent.trim)
    val output = s"The ${checkername} checker results: ${success}"
    val exitcode = 0
    (success, output, exitcode, ResultType.STRING)
  }
}

