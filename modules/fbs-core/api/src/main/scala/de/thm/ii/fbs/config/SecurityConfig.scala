package de.thm.ii.fbs.config

import org.springframework.context.annotation.Configuration
import org.springframework.security.web.SecurityFilterChain

import java.util
import javax.servlet.Filter
import javax.servlet.http.HttpServletRequest


@Configuration
class SecurityConfig extends SecurityFilterChain {
  override def matches(request: HttpServletRequest): Boolean = true

  override def getFilters: util.List[Filter] = util.List.of()
}
