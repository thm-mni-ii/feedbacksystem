package de.thm.ii.fbs.services.checker.`trait`

trait CheckerServiceHandle {
  def handle(sid: Int, ccid: Int, exitCode: Int, resultText: String, extInfo: String): Unit
}
