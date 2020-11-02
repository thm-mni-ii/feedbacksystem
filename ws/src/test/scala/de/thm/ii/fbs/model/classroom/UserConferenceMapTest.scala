package de.thm.ii.fbs.model.classroom

import de.thm.ii.fbs.model.{GlobalRole, User}
import de.thm.ii.fbs.services.conferences.{BBBService, ConferenceService, ConferenceServiceFactoryService}
import org.junit.runner.RunWith
import org.junit.{AfterClass, Assert, BeforeClass, Test}
import org.mockserver.integration.ClientAndServer
import org.mockserver.integration.ClientAndServer.startClientAndServer
import org.mockserver.mock.action.ExpectationCallback
import org.mockserver.model.{HttpRequest, HttpResponse}
import org.mockserver.model.HttpRequest.request
import org.mockserver.model.HttpResponse.response
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

import scala.collection.mutable

/**
  * Tests the UserConferenceMap
  */
@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[RestTemplateAutoConfiguration]))
@ContextConfiguration(classes = Array(classOf[ConferenceServiceFactoryService]))
class UserConferenceMapTest {
  /**
    * Factory for conference Services
    */
  @Autowired
  private val conferenceServiceFactoryService: ConferenceServiceFactoryService = null

  /**
    * Tests the map method
    */
  @Test
  def mapTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    Assert.assertEquals(1, userConferenceMap.getAll.size)
  }

  /**
    * Tests the get method by Conference
    */
  @Test
  def getByConferenceTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val testUserOption = userConferenceMap.get(testConference)
    Assert.assertFalse(testUserOption.isEmpty)
  }

  /**
    * Tests the get method by Principal
    */
  @Test
  def getByPrincipalTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val testConferenceOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isDefined)
    val testConferenceOptionEmpty = userConferenceMap.get(exampleUser)
    Assert.assertTrue(testConferenceOptionEmpty.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deleteConferenceTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testConference)
    val testConferenceOption = userConferenceMap.get(testUser)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the delete method
    */
  @Test
  def deletePrincipalTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testUser)
    val testConferenceOption = userConferenceMap.get(testConference)
    Assert.assertTrue(testConferenceOption.isEmpty)
  }

  /**
    * Tests the onMap method
    */
  @Test
  def onMapTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onMap((Conference, principal) => {
      Assert.assertEquals(testConference, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testConference, testUser)
    Assert.assertTrue(run)
  }

  /**
    * Tests the onDelete method
    */
  def onDeleteTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    var run = false
    userConferenceMap.onDelete((Conference, principal) => {
      Assert.assertEquals(testConference, Conference)
      Assert.assertEquals(testUser, principal)
      run = true
    })
    userConferenceMap.map(testConference, testUser)
    userConferenceMap.delete(testConference)
    Assert.assertTrue(run)
  }

  /**
    * Tests the exists method
    */
  def existsTest(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val existingUser = userConferenceMap.exists(testUser)
    Assert.assertTrue(existingUser)
    val nonExistingUser = userConferenceMap.exists(exampleUser)
    Assert.assertTrue(nonExistingUser)
  }

  /**
    * Tests the getConference method
    */
  def getConferencesTests(): Unit = {
    val conferenceService: ConferenceService = conferenceServiceFactoryService(BBBService.name)
    val testConference = conferenceService.createConference(0)
    val userConferenceMap = new UserConferenceMap
    userConferenceMap.map(testConference, testUser)
    val Conferences = userConferenceMap.getConferences(2)
    Assert.assertEquals(1, Conferences.size)
  }

  private val testUser = new User("Test", "User",
    "test.user@example.org", "test", GlobalRole.USER, None, 0)
  private val exampleUser = new User("Example", "User",
    "example.user@example.org", "example", GlobalRole.USER, None, 0)
}
object UserConferenceMapTest {
  private var mockServer: ClientAndServer = _

  /**
    * Executed before the tests of this class are run
    */
  @BeforeClass def startServer(): Unit = {
    mockServer = startClientAndServer(5080)
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
