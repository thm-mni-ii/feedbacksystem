package de.thm.ii.fbs.services

import de.thm.ii.fbs.types.DockerCmdConfig

import scala.sys.process.{Process, ProcessLogger}
import scala.util.Properties

/**
  * Helper object for running Docker Containers
  *
  * @author Max Stephan
  */
object DockerService {
  private val DOCKER_CMD = "docker"
  private val DOCKER_RUN = "run"
  private val DOCKER_REMOVE = "--rm"

  private def buildCmd(config: DockerCmdConfig): Seq[String] = {
    val builder = Seq.newBuilder[String]
    builder += DOCKER_CMD
    builder += DOCKER_RUN
    builder += DOCKER_REMOVE
    builder ++= config.mount.flatMap(getMountString)
    builder ++= config.dockerOptions
    builder += config.image
    builder ++= config.runOptions

    builder.result()
  }

  private def getMountString(mount: (String, String)): Seq[String] = {
    Seq("-v", s"${mount._1}:${mount._2}")
  }

  /**
    * Function to run a Docker Container
    *
    * @param config Config for the Docker Command
    * @return (exit code, stdout, stderr)
    */
  def runContainer(config: DockerCmdConfig): (Int, String, String) = {
    val cmd = buildCmd(config)

    val stdoutStream = new StringBuilder
    val stderrStream = new StringBuilder
    val procLogger = ProcessLogger((o: String) => stdoutStream.append(o), (e: String) => stderrStream.append(e))

    // Run Docker Container
    val exitCode = Process(cmd).!(procLogger)

    (exitCode, stdoutStream.toString(), stderrStream.toString())
  }

  /**
    * Concat the stdout and stderr
    *
    * @param stdout Der stdout string
    * @param stderr Der stderr string
    * @return A string with stdout and stderr
    */
  def concatOutput(stdout: String, stderr: String): String = {
    s"$stdout\n$stderr"
  }

  /**
    * Get the Bash Docker image name
    *
    * Read the name form the env `BASH_DOCKER`, will fallback to `thmmniii/bashenv:dev-latest`
    *
    * @return Bash Docker image name
    */
  def getBashImage: String = Properties.envOrElse("BASH_DOCKER", "thmmniii/bashenv:dev-latest")

  /**
    * Convert the MountLocation to the Host Paths.
    * This function is necessary if the program is executed in a Docker-Container,
    * there the path pointing to the files in the Docker-Contianer is adjusted to fit outside the container.
    *
    * @param mount Sequence of Mount files
    * @return Converted mount Sequence
    */
  def convertMountLocation(mount: Seq[(String, String)]): Seq[(String, String)] = {
    mount.map(m => (FileService.getDockerTempPath(m._1), m._2))
  }
}
