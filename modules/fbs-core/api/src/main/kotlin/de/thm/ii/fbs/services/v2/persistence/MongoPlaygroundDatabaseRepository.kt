package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.model.v2.playground.MongoPlaygroundDatabase
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories

@EnableMongoRepositories(basePackages = ["de.thm.ii.fbs.services.v2.persistence"], mongoTemplateRef = "playgroundMongoTemplate")
interface MongoPlaygroundDatabaseRepository : MongoRepository<MongoPlaygroundDatabase, String> {
    fun findByOwner_IdAndDeleted(ownerId: Int, deleted: Boolean): List<MongoPlaygroundDatabase>

    fun findByOwner_IdAndIdAndDeleted(ownerId: Int, databaseId: String, deleted: Boolean): MongoPlaygroundDatabase?

    fun findByOwner_IdAndActiveAndDeleted(ownerId: Int, active: Boolean, deleted: Boolean): MongoPlaygroundDatabase?

    fun findByIdAndDeleted(databaseId: String, deleted: Boolean): MongoPlaygroundDatabase?

    fun findByShareWithGroup(shareWithGroup: Int): MongoPlaygroundDatabase?
}