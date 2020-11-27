package de.thm.ii.fbs.types

import io.vertx.scala.ext.sql.ResultSet

/**
  * Class to store the information for the SQL Extended Results
  *
  * @param expected the expected SQL Results
  * @param result   the Submission SQL Results
  * @param variable define if the Results will be compared without order
  */
class ExtResSql(var expected: Option[ResultSet], var result: Option[ResultSet], var variable: Boolean = false)
