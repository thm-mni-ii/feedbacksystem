package de.thm.ii.fbs.services.security

import de.thm.ii.fbs.TestApplication
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

import java.util.concurrent.TimeUnit
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

@RunWith(classOf[SpringRunner])
@SpringBootTest(classes = Array(classOf[TestApplication]))
@ActiveProfiles(Array("test"))
class TokenServiceTest {
  @Autowired
  private val tokenService: TokenService = null

  @Test
  def validToken(): Unit = {
    val token = tokenService.issue("Test", 30)
    val verified = tokenService.verify(token)
    assert(verified != null)
  }

  @Test
  def expiredToken(): Unit = {
    Future {
      val token = tokenService.issue("Test", 1)
      Thread.sleep(5000)
      val verified = tokenService.verify(token)
      assert(verified == null)
    }
  }
}
