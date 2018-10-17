package de.thm.ii.submissioncheck.services

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping


@Controller class HomeController {
  @RequestMapping(Array ("/")) def homePage = "index.html"

  @RequestMapping(value = Array("/**/{[path:[^\\.]*}")) def redirect: String = { // Forward to home page so that route is preserved.
    "forward:/"
  }
}