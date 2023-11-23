package de.thm.ii.fbs.services.db

import io.vertx.lang.scala.ScalaLogger

import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.io.Source
import java.io.PrintWriter
import scala.sys.process.Process

class PsqlNativeOperationsService(
                                   url: String,
                                 )(implicit ec: ExecutionContext) {
  private val logger = ScalaLogger.getLogger(this.getClass.getName)

  def dump(): Future[String] = Future(blocking {
      Process(Seq("pg_dump", "--no-acl", "--no-owner", "--inserts", url)).!!
  })

  def restore(dump: String): Future[Boolean] = Future(blocking {
    val proc = new ProcessBuilder(Seq("psql", url): _*).start()
    new PrintWriter(proc.getOutputStream).write(dump)
    proc.getOutputStream.close()
    val exit = proc.waitFor()
    exit == 0
  })
}
