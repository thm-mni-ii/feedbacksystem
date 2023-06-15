package de.thm.ii.fbs.model

import scala.collection.mutable.ListBuffer

case class TaskImportFiles(var taskConfigPath: String, var configFiles: ListBuffer[String])
