package de.thm.ii.submissioncheck.checker
import de.thm.ii.submissioncheck.JsonHelper
import de.thm.ii.submissioncheck.SecretTokenChecker.logger

import scala.util.Random

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class MultiplechoiceCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "multiplechoice"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: List[String] = List("exercise.json")
  /** define allowed submission types - to be overwritten */
  override val allowedSubmissionTypes: List[String] = List("file", "data")
  private val LABEL_TEXT = "text"

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
    logger.info("Execute Multiplechoice Checker")
      // read csv
      var (baseFilePath, configfiles) = loadCheckerConfig(taskid)

      val originalSolution = JsonHelper.jsonStrToMap(scala.io.Source.fromFile(configfiles(0).toString).mkString)
      val answers = originalSolution("answers").asInstanceOf[List[Map[String, Any]]]
      var passed = true

      val output = if (isInfo) {
        var generatedAnswer: List[Map[String, Any]] = List()
        for ((answer, i) <- answers.zipWithIndex){
          generatedAnswer = Map(LABEL_TEXT -> answer(LABEL_TEXT), "id" -> i) :: generatedAnswer
        }
        val rand = new Random()
        generatedAnswer = rand.shuffle(generatedAnswer)

        println(Map("question" -> originalSolution("question"), "answers" -> generatedAnswer))
        JsonHelper.mapToJsonStr( Map("question" -> originalSolution("question"), "answers" -> generatedAnswer) )
      } else {
        val usersSolution = JsonHelper.jsonStrToList(scala.io.Source.fromFile(submittedFilePath).mkString).asInstanceOf[Map[String, Boolean]]
        var correctedMap: List[Map[String, Any]] = List()
        for ((answer, i) <- answers.zipWithIndex) {
          val doMatch = usersSolution(i.toString) == answer("correct").asInstanceOf[Boolean]
          passed = passed && doMatch
          correctedMap = Map(LABEL_TEST -> answer(LABEL_TEXT).toString, LABEL_RESULT -> doMatch) :: correctedMap
        }
        JsonHelper.listToJsonStr(List(Map(LABEL_HEADER -> "Structure Check", LABEL_RESULT -> correctedMap)))
      }
      (passed, output, if (passed) 0 else 1)

  }
}

