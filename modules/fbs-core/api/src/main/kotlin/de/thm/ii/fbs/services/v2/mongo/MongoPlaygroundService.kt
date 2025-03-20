package de.thm.ii.fbs.services.v2.mongo

import com.mongodb.ConnectionString
import de.thm.ii.fbs.model.v2.security.LegacyToken
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory
import org.springframework.stereotype.Service

@Service
class MongoPlaygroundService {

    fun createMongoTemplate(currentToken: LegacyToken, dbId: String): MongoTemplate {
        val mongoDatabaseFactory: MongoDatabaseFactory =
            SimpleMongoClientDatabaseFactory(ConnectionString("mongodb://localhost:27018/$dbId"))

        return MongoTemplate(mongoDatabaseFactory);
    }
}