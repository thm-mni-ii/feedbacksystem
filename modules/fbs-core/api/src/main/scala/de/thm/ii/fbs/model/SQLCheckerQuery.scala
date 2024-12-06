package de.thm.ii.fbs.model

import java.util
import java.util.Optional

case class SQLCheckerError(expected: String, got: String, trace: util.List[String])

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, parsable: Boolean,
                           queryRight: Optional[Boolean], passed: Optional[Boolean],
                           tablesRight: Optional[Boolean], proAttributesRight: Optional[Boolean], selAttributesRight: Optional[Boolean],
                           stringsRight: Optional[Boolean], orderByRight: Optional[Boolean], groupByRight: Optional[Boolean],
                           joinsRight: Optional[Boolean], wildcards: Optional[Boolean], distance: Optional[Int], userId: Int, attempt: Int,
                           version: Optional[String], errors: util.List[SQLCheckerError],
                          )
