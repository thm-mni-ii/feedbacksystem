package de.thm.ii.fbs

import java.nio.file.Files

import org.junit.{Assert, Test}

class ApplicationConfigResolverTest {
  @Test
  def buildArgsKeepsDefaultConfigWhenExternalConfigExists(): Unit = {
    val args = ApplicationConfigResolver.buildArgs(
      Array("--server.port=8443"),
      Some("/tmp/fbs-core.api/application.yml")
    )

    Assert.assertEquals(
      Seq(
        "--spring.config.location=classpath:/application.yml,optional:classpath:/application.override.yml,optional:file:/tmp/fbs-core.api/application.yml",
        "--server.port=8443"
      ),
      args.toSeq
    )
  }

  @Test
  def resolveExternalConfigPathPicksFirstExistingCandidate(): Unit = {
    val tempFile = Files.createTempFile("fbs-config", ".yml")

    try {
      val resolved = ApplicationConfigResolver.resolveExternalConfigPath(
        Seq(
          tempFile.resolveSibling("missing.yml").toString,
          tempFile.toString,
          tempFile.resolveSibling("ignored.yml").toString
        )
      )

      Assert.assertEquals(Some(tempFile.toString), resolved)
    } finally {
      Files.deleteIfExists(tempFile)
    }
  }
}
