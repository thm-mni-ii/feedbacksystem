package de.thm.ii.submissioncheck.checker

import java.io.{BufferedReader, BufferedWriter, FileReader}

import de.thm.ii.submissioncheck.{JsonHelper, ResultType}
import de.thm.ii.submissioncheck.SecretTokenChecker.logger
import au.com.bytecode.opencsv.{CSVReader, CSVWriter}

import scala.collection.JavaConverters._
import scala.util.Random

/**
  * Check submissions with javascript / node, like express servers, but check also frontend with "puppeteer"
  *
  * @param compile_production flagg which compiles the path corresponding if app runs in docker or not
  */
class MultiplechoiceCheckExec(override val compile_production: Boolean) extends BaseChecker(compile_production) {
  /** the unique identification of a checker, will extended to "helloworldchecker" */
  override val checkername = "multiplechoice"
  /** define which configuration files the checker need - to be overwritten */
  override val configFiles: Map[String, Boolean] = Map("exercise.csv" -> true)
  /** define allowed submission types - to be overwritten */
  override val allowedSubmissionTypes: List[String] = List("file", "data")
  private val LABEL_TEXT = "text"

  private def toBool(data: String): Boolean = data.trim == "true"

  /**
    * perform a check of request, will be executed after processing the kafka message
    *
    * @param taskid            submissions task id
    * @param submissionid      submitted submission id
    * @param submittedFilePath path of submitted file (if zip or something, it is also a "file"
    * @param isInfo            execute info procedure for given task
    * @param use_extern        include an existing file, from previous checks
    * @param jsonMap           complete submission payload
    * @return check succeeded, output string, exitcode
    */
  override def exec(taskid: String, submissionid: String, submittedFilePath: String, isInfo: Boolean, use_extern: Boolean, jsonMap: Map[String, Any]):
  (Boolean, String, Int, String) = {
    logger.info("Execute Multiplechoice Checker")
    // read csv
    var (baseFilePath, configfiles) = loadCheckerConfig(taskid)

    val reader = new CSVReader(new FileReader(configfiles(0).toString))
    var originalSolution: List[Map[String, Boolean]] = List()
    reader.readAll().toArray().toList.asInstanceOf[List[Array[String]]].foreach(line => {
      val readerLine = line.toList
      originalSolution = Map(readerLine(0) -> toBool(readerLine(1))) :: originalSolution
      logger.warning("line50: " + originalSolution)
    })

    var passed = true

    val output = if (isInfo) {
      logger.warning("It is INFO")
      var generatedAnswer: List[Map[String, Any]] = List()
      for ((answer, i) <- originalSolution.zipWithIndex) {
        generatedAnswer = Map(LABEL_TEXT -> answer.keys.toList(0), "id" -> i) :: generatedAnswer
      }
      val rand = new Random()
      generatedAnswer = rand.shuffle(generatedAnswer)
      generatedAnswer
    } else {
      val userSolution = JsonHelper.jsonStrToMap(scala.io.Source.fromFile(submittedFilePath).mkString).asInstanceOf[Map[String, Boolean]]
      var correctedMap: List[Map[String, Any]] = List()
      logger.warning(originalSolution.toString())
      for ((answer, i) <- originalSolution.zipWithIndex) {
        val doMatch = if (!userSolution.keys.toList.contains(i.toString)) false else userSolution(i.toString) == answer.values.toList.head

        passed = passed && doMatch
        correctedMap = Map(LABEL_TEST -> answer.keys.toList(0).toString, LABEL_RESULT -> doMatch) :: correctedMap
      }
      List(Map(LABEL_HEADER -> "Multiple Choice", LABEL_RESULT -> correctedMap))
    }
    (passed, JsonHelper.listToJsonStr(output), if (passed) 0 else 1, ResultType.JSON)
  }
}

