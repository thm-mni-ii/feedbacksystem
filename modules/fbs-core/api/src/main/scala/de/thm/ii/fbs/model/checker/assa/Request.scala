package de.thm.ii.fbs.model.checker.assa

case class Request(
  sqlEnvironment: String,
  dbSchema: String,
  task: String,
  solutions: List[String],
  submissions: List[String],
  taskId: Option[String],
  userId: Option[String]
)
