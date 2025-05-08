package de.thm.ii.fbs.services.v2.mongo

import com.mongodb.ConnectionString
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import de.thm.ii.fbs.model.v2.security.LegacyToken
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory
import org.springframework.stereotype.Service
import org.springframework.beans.factory.annotation.Value

@Service
class MongoPlaygroundService {
    @Value("\${spring.data.mongodb.playground.uri}")
    private lateinit var mongoUri: String

    fun createMongoTemplate(currentToken: LegacyToken, dbId: String): MongoTemplate {
        val fullUri = "$mongoUri/$dbId"
        val factory: MongoDatabaseFactory = SimpleMongoClientDatabaseFactory(ConnectionString(fullUri))

        return MongoTemplate(factory)
    }

    fun getMongoClient(): MongoClient = MongoClients.create(mongoUri)
}