package de.thm.ii.fbs.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor

import java.util.Date
import java.util.concurrent.locks.{Lock, ReentrantLock}
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import scala.collection.mutable

@Component
class AntiBruteForceInterceptor extends HandlerInterceptor {
  private case class LoginAttempts(attempts: Int = 0, lastAttempt: Option[Date] = None)

  @Value("${security.antiBruteForce.trustedProxyCount}")
  private val trustedProxyCount: Int = 0
  @Value("${security.antiBruteForce.interval}")
  private val interval: Int = 60*10
  @Value("${security.antiBruteForce.maxAttempts}")
  private val maxAttempts: Int = 10
  @Value("${security.antiBruteForce.protectedPaths}")
  private val protectedPathsString: String = "/api/v1/login/ldap,/api/v1/login/local,/api/v1/login/unified"
  private val logins: mutable.Map[String, LoginAttempts] = mutable.HashMap()
  private val lock: Lock = new ReentrantLock(true)
  private var lastClean: Date = new Date()

  override def preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean = {
    super.preHandle(request, response, handler)
    cleanIfNeeded()

    if (protectedPaths.contains(request.getServletPath)) {
      val forwardForHeader = Option(request.getHeader("X-FORWARDED-FOR")).getOrElse("")
      val proxies: Seq[String] = forwardForHeader.split(", ").toSeq ++ Seq(request.getRemoteAddr)
      val filteredProxies = proxies.slice(0, proxies.length - trustedProxyCount)
      val ip = filteredProxies.last

      lock.lock()
      var lastLoginAttempt = logins.getOrElse(ip, LoginAttempts())
      lastLoginAttempt.lastAttempt match {
        case Some(lastAttempt) =>
          if ((new Date().getTime - lastAttempt.getTime) / 1000 > interval) {
            lastLoginAttempt = LoginAttempts()
          }
        case None => {}
      }

      if (lastLoginAttempt.attempts >= maxAttempts) {
        response.sendError(429, "Too Many Requests")
        lock.unlock()
        false
      } else {
        val currentLoginAttempt = LoginAttempts(lastLoginAttempt.attempts + 1, Some(new Date()))
        logins.put(ip, currentLoginAttempt)
        lock.unlock()
        true
      }
    } else {
      true
    }
  }

  private def cleanIfNeeded(): Unit = {
    lock.lock()
    if (new Date().getTime - lastClean.getTime / 1000 > interval) {
      for ((ip, lastLoginAttempt) <- logins) {
        lastLoginAttempt.lastAttempt match {
          case Some(lastAttempt) =>
            if ((new Date().getTime - lastAttempt.getTime) / 1000 > interval) {
              logins.remove(ip)
            }
          case None => {}
        }
      }
      lastClean = new Date()
    }
    lock.unlock()
  }

  private def protectedPaths = protectedPathsString.split(",").toSeq
}
