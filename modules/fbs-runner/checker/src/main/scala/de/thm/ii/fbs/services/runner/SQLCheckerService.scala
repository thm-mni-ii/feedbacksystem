package de.thm.ii.fbs.services.runner

import de.thm.ii.fbs.services.DockerService
import de.thm.ii.fbs.types.{DockerCmdConfig, Submission}

class SQLCheckerService(val submission: Submission) {
  def invoke(): (Int, String, String) = {
    DockerService.runContainer(new DockerCmdConfig(
      Option(System.getenv("RUNNER_SQL_CHECKER_IMAGE")).getOrElse("sql-checker"),
      env = Seq(("api", submission.apiUrl), ("mongodb", submission.mongodbUrl)),
      networks = if (System.getenv("RUNNER_SQL_CHECKER_DISABLE_NETWORK") != "true") {Seq("feedbacksystem_fbs")} else {Seq()}
    ))
  }
}
