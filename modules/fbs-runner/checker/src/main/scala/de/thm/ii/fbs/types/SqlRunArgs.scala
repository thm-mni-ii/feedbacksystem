package de.thm.ii.fbs.types

/**
  * Class to Store all SqlRunner Configurations
  *
  * @param section         sql sections
  * @param dbConfig        sql database queries
  * @param submissionQuery submitted Query
  * @param runnerId        the runner ID
  * @param submissionId    the submission ID
  * @param queryType the type of the Query
  */
class SqlRunArgs(val section: Array[TaskQuery],
                 val dbType: String,
                 val dbConfig: String,
                 val submissionQuery: String,
                 val runnerId: Int,
                 val submissionId: Int,
                 val queryType: String)
