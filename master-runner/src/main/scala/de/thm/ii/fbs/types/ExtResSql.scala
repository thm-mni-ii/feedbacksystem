package de.thm.ii.fbs.types

import io.vertx.scala.ext.sql.ResultSet

/**
  * Class to store the information for the SQL Extended Results
  *
  * @param expected the expected SQL Results
  * @param result   the Submission SQL Results
  */
class ExtResSql(var expected: Option[ResultSet], var result: Option[ResultSet])
