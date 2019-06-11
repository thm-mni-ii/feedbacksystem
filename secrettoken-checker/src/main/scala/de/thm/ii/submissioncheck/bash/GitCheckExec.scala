package de.thm.ii.submissioncheck.bash
import java.io.ByteArrayOutputStream
import java.nio.file.{Files, Paths}

import de.thm.ii.submissioncheck.SecretTokenChecker.ULDIR
import org.slf4j.LoggerFactory

import scala.sys.process.Process

/**
  * Provides a service to download / clone a git uri
  * @param submission_id users submission id
  * @param git_url git url
  */
class GitCheckExec(val submission_id: String, val git_url: String) {
  private val logger = LoggerFactory.getLogger(this.getClass)
  /** save the output of our execution */
  var output: String = ""

  /**
    * run the git clone process
    * @return exitcode
    */
  def exec(): Int = {
    var dockerRelPath = System.getenv("HOST_UPLOAD_DIR")
    if (dockerRelPath == null) {
      dockerRelPath = ULDIR
    }

    dockerRelPath+="/GITCHECKER"
    val target_dir = dockerRelPath + "/" + submission_id
    logger.warn(dockerRelPath)
    logger.warn(target_dir)

    Files.createDirectories(Paths.get(target_dir))

    var seq: Seq[String] = null
    val stdoutStream = new ByteArrayOutputStream
    seq = Seq("clone", git_url, target_dir)

    val exitCode = Process("git", seq).#>(stdoutStream).run().exitValue()

    output = stdoutStream.toString

    exitCode
  }

  /**
    * get systems public key
    * @return public key
    */
  def getPublicKey(): String = {
    var seq: Seq[String] = null
    val stdoutStream = new ByteArrayOutputStream
    seq = Seq(System.getenv("HOME") + "/.ssh/id_rsa.pub")

    val exitcode = Process("cat", seq).#>(stdoutStream).run().exitValue()
    stdoutStream.toString
  }
}
