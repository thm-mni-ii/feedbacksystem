package de.thm.ii.fbs.types

/**
  * Class to Store all SqlRunner Configurations
  *
  * @param section         sql sections
  * @param dbConfig        sql database queries
  * @param submissionQuery submitted Query
  * @param runnerId        the runner ID
  * @param submissionId    the submission ID
  */
class SqlRunArgs(val section: Array[TaskQuery], val dbConfig: String, val submissionQuery: String, val runnerId: Int, val submissionId: Int)
