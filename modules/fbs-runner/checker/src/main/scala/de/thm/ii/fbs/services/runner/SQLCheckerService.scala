package de.thm.ii.fbs.services.runner

import de.thm.ii.fbs.services.DockerService
import de.thm.ii.fbs.types.{DockerCmdConfig, Submission}

class SQLCheckerService(val submission: Submission) {
  def invoke(): (Int, String, String) = {
    DockerService.runContainer(new DockerCmdConfig(
      "sql-checker",
      env = Seq(("api", submission.apiUrl)),
      networks = Seq("feedbacksystem_fbs")
    ))
  }
}
