package de.thm.ii.fbs

import de.thm.ii.fbs.config.MongoConfig
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.data.mongodb.autoconfigure.DataMongoAutoConfiguration
import org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration

@SpringBootApplication(exclude = Array(
  classOf[MongoAutoConfiguration],
  classOf[DataMongoAutoConfiguration]
))
class TestApplication extends Application
