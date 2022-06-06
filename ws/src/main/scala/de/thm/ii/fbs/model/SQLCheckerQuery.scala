package de.thm.ii.fbs.model

import java.util.Optional

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, queryRight: Boolean, parsable: Boolean,
                           tablesRight: Optional[Boolean], attributesRight: Optional[Boolean], whereAttributesRight: Optional[Boolean],
                           stringsRight: Optional[Boolean], userId: Int, attempt: Int)
