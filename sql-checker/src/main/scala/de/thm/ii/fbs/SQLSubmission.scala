package de.thm.ii.fbs

/**
  * A submission for a sql task
  * @author Vlad Sokyrskyy
  * @param query The user query as a String
  * @param taskid the taskid
  * @param username CAS name of the user of the submission
  */
class SQLSubmission(val query: String, val taskid: String, val username: String)
