package de.thm.ii.fbs.services.v2.mongo

import com.mongodb.ConnectionString
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import de.thm.ii.fbs.model.v2.security.LegacyToken
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory
import org.springframework.stereotype.Service
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Service
class MongoPlaygroundService {
    @Value("\${spring.data.mongodb.playground.uri}")
    private lateinit var mongoUri: String

    @Value("\${spring.data.mongodb.playground.authSource}")
    private lateinit var authSource: String

    fun createMongoTemplate(currentToken: LegacyToken, dbId: String): MongoTemplate {
        val fullUri = buildMongoUri(mongoUri, dbId, authSource)
        val factory: MongoDatabaseFactory = SimpleMongoClientDatabaseFactory(ConnectionString(fullUri))

        return MongoTemplate(factory)
    }

    fun getMongoClient(): MongoClient = MongoClients.create(mongoUri)

    private fun buildMongoUri(url: String, useDbName: String, authDbName: String): String {
        val uri = URI(url)

        return URI(
            uri.scheme,
            uri.authority,
            "/$useDbName",
            "authSource=${URLEncoder.encode(authDbName, StandardCharsets.UTF_8.toString())}",
            uri.fragment
        ).toString()
    }
}
