package de.thm.ii.fbs.config

import com.mongodb.client.{MongoClient, MongoClients}
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.core.MongoTemplate

@Configuration
class MongoConfig {
  @Value("${spring.data.mongodb.uri}") private val mongoUri: String = ""
  @Value("${spring.data.mongodb.database}") private val mongoDatabaseName: String = ""

  @Bean def mongoClient: MongoClient = MongoClients.create(mongoUri)
  @Bean def mongoTemplate: MongoTemplate = new MongoTemplate(mongoClient, mongoDatabaseName)
}
