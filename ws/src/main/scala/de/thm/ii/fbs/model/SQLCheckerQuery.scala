package de.thm.ii.fbs.model

import java.util.Optional

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, queryRight: Boolean, parsable: Boolean,
                           tablesRight: Optional[Boolean], proAttributesRight: Optional[Boolean], selAttributesRight: Optional[Boolean],
                           stringsRight: Optional[Boolean], userId: Int, attempt: Int)
