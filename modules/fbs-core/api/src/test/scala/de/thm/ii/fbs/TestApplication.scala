package de.thm.ii.fbs

import de.thm.ii.fbs.config.MongoConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration

@SpringBootApplication(exclude = Array(
  classOf[MongoAutoConfiguration],
  classOf[MongoDataAutoConfiguration]
))
class TestApplication extends Application
