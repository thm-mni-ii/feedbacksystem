package de.thm.ii.submissioncheck.checker

import org.slf4j.LoggerFactory


/**
  * Check submissions with javascript / node, like express servers, but check also frontedn with "puppeteer"
  * @param submission_id users submission id
  * @param taskid submissions task id
  * @param submission_path_url path of folder with js content
  */
class NodeCheckExec(val submission_id: String, val taskid: Any, val submission_path_url: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** save the output of our execution */
  var output: String = ""
  private val startCode = -99
  /** save the success of our execution */
  var success: Boolean = false
  /** save the exit code of our execution */
  var exitCode: Int = startCode

  /**
    * execute on node docker
    * @return exitcode
    */
  def exec(): Int = {
    logger.info("Execute Node Checker")
    this.exitCode
  }
}

/**
  * static context for NodeCheckExec
  */
object NodeCheckExec {
  private val logger = LoggerFactory.getLogger(this.getClass)

  /**
    * save incoming tasks settings / infos
    * @param jsonMap a kafka record
    */
  def onNodeTaskReceived(jsonMap: Map[String, Any]): Unit = {}

  /**
    * handle incoming submissions
    * @param jsonMap a kafka record
    */
  def onNodeReceived(jsonMap: Map[String, Any]): Unit = {}
}
