package de.thm.ii.fbs.services.conferences

import org.junit.{Assert, Test}
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

/**
  * Tests ConferenceServiceFactoryServiceTests
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[ConferenceServiceFactoryService]))
class ConferenceServiceFactoryServiceTests {
  @Autowired
  private val ConferenceServiceFactoryService: ConferenceServiceFactoryService = null;

  /**
    * Tests the creation of a bbb service
    */
  @Test
  def createBBBServiceTest(): Unit = {
    val bbbService = ConferenceServiceFactoryService("bigbluebutton")
    Assert.assertTrue(bbbService.isInstanceOf[BBBService])
  }

  /**
    * Tests the creation of a bbb service
    */
  @Test
  def createJitsiServiceTest(): Unit = {
    val bbbService = ConferenceServiceFactoryService("jitsi")
    Assert.assertTrue(bbbService.isInstanceOf[JitsiService])
  }

  /**
    * Tests the creation of a bbb service
    */
  @Test
  def createNonExistingServiceTest(): Unit = {
    var exception = false
    try {
      ConferenceServiceFactoryService("nonExisting")
    } catch {
      case _: IllegalArgumentException => exception = true
    }
    Assert.assertTrue(exception)
  }
}
