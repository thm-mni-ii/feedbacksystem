package de.thm.ii.fbs.config

import com.mongodb.client.{MongoClient, MongoClients}
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration, Primary}
import org.springframework.data.mongodb.core.MongoTemplate

@Configuration
class MongoConfig {
  @Value("${spring.data.mongodb.sqlchecker.uri}") private val mongoUri: String = ""
  @Value("${spring.data.mongodb.sqlchecker.database}") private val mongoDatabaseName: String = ""

  @Bean def mongoClient: MongoClient = MongoClients.create(mongoUri)
  @Primary @Bean(name = Array("mongodbTemplate")) def mongoTemplate: MongoTemplate = new MongoTemplate(mongoClient, mongoDatabaseName)
}
