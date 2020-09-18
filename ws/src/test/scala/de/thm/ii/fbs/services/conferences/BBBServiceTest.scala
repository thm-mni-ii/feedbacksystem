package de.thm.ii.fbs.services.conferences
import java.util.UUID

import de.thm.ii.fbs.model.{GlobalRole, User}
import org.junit.{AfterClass, BeforeClass, Test, Assert}
import org.junit.runner.RunWith
import org.mockserver.integration.ClientAndServer
import org.mockserver.integration.ClientAndServer.startClientAndServer
import org.mockserver.mock.action.ExpectationCallback
import org.mockserver.model.HttpRequest.request
import org.mockserver.model.HttpResponse.response
import org.mockserver.model.{HttpRequest, HttpResponse}
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

import scala.collection.mutable

/**
  * Tests BBBService
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[BBBService]))
class BBBServiceTest {
  @Value("${services.bbb.service-url}")
  private val apiUrl: String = null

  @Autowired
  private val bbbService: BBBService = null;

  /**
    * Tests the conference registration
    */
  @Test
  def registerBBBConferenceTest: Unit = {
    bbbService.setApiURL("http://localhost:1080/bbb")
    val id = UUID.randomUUID().toString
    val password = UUID.randomUUID().toString
    val moderatorPassword = UUID.randomUUID().toString
    val success = bbbService.registerBBBConference(id, "Test Meeting", password, moderatorPassword)

    Assert.assertTrue(success)
  }

  /**
    * Tests the conference link generation
    */
  @Test
  def getBBBConferenceLinkTest: Unit = {
    bbbService.setApiURL(apiUrl)
    val user = new User( "test", "Test", "test@example.org", "User", GlobalRole.USER, Option.empty[String], 0) ;
    val id = UUID.randomUUID().toString
    val password = UUID.randomUUID().toString
    val conferenceLink = bbbService.getBBBConferenceLink(user, id, password)

    val uri = conferenceLink.toString
    Assert.assertTrue(uri.startsWith(apiUrl))
    Assert.assertTrue(uri.contains(s"${user.prename}%20${user.surname}"))
    Assert.assertTrue(uri.contains(id))
    Assert.assertTrue(uri.contains(password))
  }
}

object BBBServiceTest {
  private var mockServer: ClientAndServer = _

  /**
    * Executed before the tests of this class are run
    */
  @BeforeClass def startServer(): Unit = {
    mockServer = startClientAndServer(1080)
    mockServer.when(request.withPath("/bbb/api/create")).callback(new ExpectationCallback() {
      override def handle(httpRequest: HttpRequest): HttpResponse = {
        val queryMap = new mutable.HashMap[String, String]()
        for (i <- 0 until httpRequest.getQueryStringParameters.size()) {
          val param = httpRequest.getQueryStringParameters.get(i)
          val key = param.getName.getValue
          val value = param.getValues.get(0).getValue
          queryMap.put(key, value)
        }
        val missingParam = List("name", "meetingID", "attendeePW", "moderatorPW", "checksum")
          .exists(paramName => !queryMap.contains(paramName))
        if (missingParam) {
          response().withStatusCode(400)
        } else {
          response().withStatusCode(200)
        }
      }
    })
  }

  /**
    * Executed after the tests of this class are run
    */
  @AfterClass def stopServer(): Unit = {
    mockServer.stop
  }
}
