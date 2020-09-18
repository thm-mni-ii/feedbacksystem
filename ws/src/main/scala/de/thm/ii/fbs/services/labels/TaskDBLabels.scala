package de.thm.ii.fbs.services.labels

/**
  * Class holds all DB labels
  */
object TaskDBLabels {
  /** DB Label "task_id" */
  var taskid: String = "task_id"

  /** DB Label "name" */
  var name: String = "task_name"

  /** DB Label "description" */
  var description: String = "task_description"

  /** DB Label "course_id" */
  var courseid: String = "course_id"

  /** DB Label "deadline" */
  var deadline = "deadline"

  /** DB Label plagiat_check_done */
  var plagiat_check_done = "plagiat_check_done"

  /** DB Label external_description */
  var external_description = "external_description"

  /** DB Label load_external_description */
  var load_external_description = "load_external_description"

  /** DB Label "testsystem_modus" */
  var testsystem_modus = "testsystem_modus"
}
