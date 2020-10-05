package de.thm.ii.fbs.types

/**
  * Configuration Object for the DockerHelper
  *
  * @param image         Docker image to Start
  * @param mount         Files to mount
  * @param dockerOptions Options that will be passed to the Docker command
  * @param runOptions    Options that will be passed to the Docker Container
  * @author Max Stephan
  */
class DockerCmdConfig(val image: String,
                      var mount: Seq[(String, String)] = Seq.empty,
                      var dockerOptions: Seq[String] = Seq.empty,
                      var runOptions: Seq[String] = Seq.empty)
