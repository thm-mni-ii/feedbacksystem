package de.thm.ii.fbs.util

import java.io.File
import java.nio.file.{Files, Paths}
import com.typesafe.config.{Config, ConfigFactory}

/**
  * Loads configuration files.
  */
object Configs {
  private val PROD_CONFIG = "/usr/local/appconfig/application.conf"

  /**
    * Loads a configuration for the system.
    * It prefers an extern configuration that can be found in PROD_CONFIG,
    * alternatively it loads the default configuration in the resources folder.
    * @return The config object.
    */
  def load(): Config = {
    (if (Files.exists(Paths.get(PROD_CONFIG))) {
      val configFile = ConfigFactory.parseFile(new File(PROD_CONFIG))
      ConfigFactory.load(configFile)
    } else {
      ConfigFactory.parseResources("application.conf")
    }).resolve()
  }
}
