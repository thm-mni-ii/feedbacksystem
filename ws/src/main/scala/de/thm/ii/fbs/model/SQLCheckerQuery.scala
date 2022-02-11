package de.thm.ii.fbs.model

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, queryRight: Boolean, parsable: Boolean,
                           tablesRight: Boolean, attributesRight: Boolean, whereAttributesRight: Boolean,
                           stringsRight: String, userId: Int, attempt: Int)
