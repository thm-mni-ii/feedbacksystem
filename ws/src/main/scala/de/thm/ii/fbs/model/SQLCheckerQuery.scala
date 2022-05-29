package de.thm.ii.fbs.model

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, queryRight: Boolean, parsable: Boolean,
                           tablesRight: Option[Boolean], attributesRight: Option[Boolean], whereAttributesRight: Option[Boolean],
                           stringsRight: Option[Boolean], userId: Int, attempt: Int)
