package de.thm.ii.fbs.utils.v2.config

import com.mongodb.ConnectionString
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories

@Configuration
@EnableMongoRepositories(
    basePackages = ["de.thm.ii.fbs.services.v2.persistence"],
    mongoTemplateRef = "playgroundMongoTemplate"
)
open class MongoPlaygroundConfiguration {

    @Bean
    open fun mongoPlaygroundDatabaseFactory(): MongoDatabaseFactory {
        return SimpleMongoClientDatabaseFactory(ConnectionString("mongodb://localhost:27018/playground-db"))
    }

    @Bean(name=["playgroundMongoTemplate"])
    open fun playgroundMongoTemplate(): MongoTemplate {
        return MongoTemplate(mongoPlaygroundDatabaseFactory())
    }
}