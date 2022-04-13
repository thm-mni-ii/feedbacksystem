package de.thm.ii.fbs.model

case class SQLCheckerQuery(id: String, taskNumber: String, statement: String, queryRight: Boolean, parsable: Boolean,
                           isSolution: Boolean, tablesRight: Boolean, proAttributesRight: Boolean, selAttributesRight: Boolean,
                           stringsRight: String, userId: Int, attempt: Int)
