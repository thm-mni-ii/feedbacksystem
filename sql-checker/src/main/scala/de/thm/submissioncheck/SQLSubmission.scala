package de.thm.submissioncheck

/**
  * A submission for a sql task
  * @author Vlad Sokyrskyy
  * @param userquery The user query as a String
  * @param task the taskid
  * @param name CAS name of the user of the submission
  */
class SQLSubmission(val userquery: String, val task: String, val name: String){
  /**
    * Class instance
    */
  val query = userquery
  /**
    * Class instance
    */
  val taskid = task
  /**
    * Class instance
    */
  val username = name
}
