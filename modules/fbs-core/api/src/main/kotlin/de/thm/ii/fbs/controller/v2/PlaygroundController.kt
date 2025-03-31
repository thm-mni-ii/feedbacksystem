@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.controller.v2

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.mongodb.MongoCommandException
import com.mongodb.client.MongoClients
import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.playground.*
import de.thm.ii.fbs.model.v2.playground.api.*
import de.thm.ii.fbs.model.v2.security.LegacyToken
import de.thm.ii.fbs.services.v2.checker.SqlPlaygroundCheckerService
import de.thm.ii.fbs.services.v2.mongo.MongoPlaygroundService
import de.thm.ii.fbs.services.v2.persistence.*
import de.thm.ii.fbs.utils.v2.annotations.CurrentToken
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import de.thm.ii.fbs.utils.v2.mongo.MongoSecurityValidator
import org.bson.Document
import org.bson.conversions.Bson
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import kotlin.jvm.optionals.getOrNull

@RestController
@RequestMapping(path = ["/api/v2/playground/{uid}/databases"])
class PlaygroundController(
    private val userRepository: UserRepository,
    private val databaseRepository: SqlPlaygroundDatabaseRepository,
    private val entityRepository: SqlPlaygroundEntityRepository,
    private val queryRepository: SqlPlaygroundQueryRepository,
    private val sqlPlaygroundCheckerService: SqlPlaygroundCheckerService,
    private val groupRepository: GroupRepository,
    private val mongoPlaygroundService: MongoPlaygroundService
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentToken currentToken: LegacyToken): List<SqlPlaygroundDatabase> =
        databaseRepository.findByOwner_IdAndDeleted(currentToken.id, false)

    @PostMapping
    @ResponseBody
    fun create(
        @CurrentToken currentToken: LegacyToken,
        @RequestBody database: SqlPlaygroundDatabaseCreation,
        @RequestParam(required = false, defaultValue = "POSTGRES") dbType: PlaygroundDatabaseType
    ): Any {
        val user = userRepository.findById(currentToken.id).orElseThrow {
            NotFoundException()
        }

        return when (dbType) {
            PlaygroundDatabaseType.POSTGRES -> {
                val db = SqlPlaygroundDatabase(
                    database.name,
                    "PostgreSQL 14",
                    "POSTGRES",
                    user,
                    true
                )

                val currentActiveDb = databaseRepository.findByOwner_IdAndActiveAndDeleted(currentToken.id, true, false)
                if (currentActiveDb != null) {
                    currentActiveDb.active = false
                    databaseRepository.save(currentActiveDb)
                }

                val newDb = databaseRepository.save(db)
                createAllEntities(newDb)
                newDb
            }

            PlaygroundDatabaseType.MONGO -> {
                val prefixedDbName = "mongo_playground_student_${currentToken.id}_${database.name.replace(" ", "_")}"
                val db = MongoPlaygroundDatabase(
                    prefixedDbName,
                    version = "MongoDB 8.0",
                    "MONGO",
                    user,
                    true
                )

                val mongoTemplate = mongoPlaygroundService.createMongoTemplate(currentToken, prefixedDbName)
                mongoTemplate.save(db)
                db
            }
        }
    }

    @PostMapping("/mongo/{dbId}/execute")
    @ResponseBody
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun executeMongoQuery(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
        @RequestBody mongoQuery: MongoPlaygroundQueryDTO
    ): Any? {
        val mongoTemplate = mongoPlaygroundService.createMongoTemplate(currentToken, dbId)
        val criteria = mongoQuery.criteria ?: Document()
        val up = Update().apply {
            mongoQuery.update?.forEach { (key, value) ->
                set(key, value)
            }
        }
        val query = Query(Criteria().apply {
            criteria.forEach { (key, value) -> this.and(key).`is`(value) }
        })

        MongoSecurityValidator.validate(mongoQuery.operation, mongoQuery)
        return when (mongoQuery.operation) {
            "insert" -> {
                mongoQuery.document ?: throw IllegalArgumentException("Document cannot be null for insert operation")
                mongoTemplate.insert(mongoQuery.document, mongoQuery.collection)
            }

            "find" -> {
                if (mongoQuery.projection != null) {
                    val queryWithProjection = Query(Criteria().apply {
                        criteria.forEach { (key, value) -> this.and(key).`is`(value) }
                    })

                    queryWithProjection.fields().apply {
                        mongoQuery.projection.forEach { (key, value) ->
                            if (value == 1 || value == true) include(key)
                            if (value == 0 || value == false) exclude(key)
                        }
                    }
                    mongoTemplate.find(queryWithProjection, Document::class.java, mongoQuery.collection)
                } else mongoTemplate.find(query, Document::class.java, mongoQuery.collection)
            }

            "aggregate" -> {
                val pipe = mongoQuery.pipeline
                    ?: throw UnsupportedOperationException("Pipeline is required for aggregate operation")

                mongoTemplate.db.getCollection(mongoQuery.collection)
                    .aggregate(pipe)
                    .toList()
            }

            "update" -> mongoTemplate.updateFirst(query, up, mongoQuery.collection)
            "delete" -> mongoTemplate.remove(query, mongoQuery.collection)

            else -> throw UnsupportedOperationException("Operation ${mongoQuery.operation} is not supported")
        }
    }

    @GetMapping("/mongo/list")
    @ResponseBody
    fun getMongoDatabase(@CurrentToken currentToken: LegacyToken): List<String> {
        return MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            mongoClient.listDatabaseNames().filter {
                it.startsWith("mongo_playground_student_${currentToken.id}_")
            }
        }
    }

    @DeleteMapping("/mongo/{dbId}")
    @ResponseBody
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMongoDatabase(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: String) {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            mongoClient.getDatabase(databaseName).drop()
        }
    }

    @PostMapping("/mongo/{dbId}/reset")
    @ResponseBody
    fun resetMongoDatabase(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String
    ): Map<String, List<String>> {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            val collections = db.listCollectionNames()
                .filter { it != "mongo_playground_database" }
                .onEach { db.getCollection(it).drop() }
                .toList()

            return mapOf("collections" to collections)
        }
    }

    @PostMapping("/mongo/{dbId}/create-view")
    @ResponseBody
    fun createMongoView(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
        @RequestBody request: MongoViewDTO
    ) {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            db.createView(request.viewName, request.collectionSource, request.pipeline)
        }
    }

    @GetMapping("/mongo/{dbId}/views")
    @ResponseBody
    fun getMongoView(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String
    ): List<String> {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            return db.listCollections()
                .filter { it.getString("type") == "view" }
                .map { it.getString("name") }
                .toList()
        }
    }

    @DeleteMapping("/mongo/{dbId}/views/{viewName}")
    @ResponseBody
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteMongoView(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
        @PathVariable("viewName") viewName: String
    ) {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            val collectionsNames = db.listCollectionNames().toList()

            if (!collectionsNames.contains(viewName))
                throw NotFoundException()

            db.getCollection(viewName).drop()
        }
    }

    @PostMapping("/mongo/{dbId}/create-index")
    @ResponseBody
    fun createMongoIndex(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
        @RequestBody request: MongoIndexDTO
    ): Map<String, Any> {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            val index = Document(request.index)
            val indexName = db.getCollection(request.collection).createIndex(index)

            return mapOf("createdIndex" to indexName)
        }
    }

    @GetMapping("/mongo/{dbId}/indexes")
    @ResponseBody
    fun getMongoIndexes(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
    ): List<Map<String, Any>> {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            return db.listCollectionNames()
                .filter { it !in listOf("system.views", "mongo_playground_database") }
                .map { collectionName ->
                    val indexes = db.getCollection(collectionName).listIndexes()
                        .map { index ->
                            mapOf(
                                "name" to index.getString("name"),
                                "key" to index.get("key", Document::class.java)
                            )
                        }.toList()
                    mapOf(
                        "collection" to collectionName,
                        "indexes" to indexes
                    )
                }.toList()
        }
    }

    @DeleteMapping("/mongo/{dbId}/indexes/{collection}/{indexName}")
    @ResponseBody
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun deleteIndex(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: String,
        @PathVariable("collection") collection: String,
        @PathVariable("indexName") indexName: String
    ) {
        val databaseName = "mongo_playground_student_${currentToken.id}_$dbId"

        MongoClients.create("mongodb://localhost:27018").use { mongoClient ->
            val db = mongoClient.getDatabase(databaseName)

            if (!mongoClient.listDatabaseNames().contains(databaseName))
                throw NotFoundException()

            if (!db.listCollectionNames().contains(collection))
                throw NotFoundException()

            try {
                db.getCollection(collection).dropIndex(indexName)
            } catch (ex: MongoCommandException) {
                if (ex.errorCode == 27)
                    throw NotFoundException()
                else
                    throw ex
            }
        }
    }

    @DeleteMapping("/{dbId}")
    @ResponseBody
    fun delete(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        sqlPlaygroundCheckerService.deleteDatabase(db, currentToken.id, currentToken.username)
        db.active = false
        db.deleted = true
        databaseRepository.save(db)
        return db
    }

    @GetMapping("/{dbId}")
    @ResponseBody
    fun get(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase =
        getDatabase(currentToken.id, dbId)

    @PostMapping("/{dbId}/activate")
    @ResponseBody
    fun activate(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): SqlPlaygroundDatabase {
        val db =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        db.active = true
        val currentActiveDb = databaseRepository.findByOwner_IdAndActiveAndDeleted(currentToken.id, true, false)
        if (currentActiveDb !== null) {
            currentActiveDb.active = false
            databaseRepository.save(currentActiveDb)
        }
        return databaseRepository.save(db)
    }

    @PostMapping("/{dbId}/share")
    @ResponseBody
    fun createPlaygroundShare(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int
    ): SqlPlaygroundShareResponse {
        val currentActiveDb =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        val url = sqlPlaygroundCheckerService.shareDatabase(currentActiveDb)
        return SqlPlaygroundShareResponse(url)
    }

    @PutMapping("/{dbId}/share-with-group")
    @ResponseBody
    fun setPlaygroundShareWithGroup(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int,
        @RequestBody shareWithGroup: SqlPlaygroundShareWithGroupRequest
    ): SqlPlaygroundDatabase {
        val db =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        val group = getGroup(shareWithGroup.groupId, currentToken.id)
        db.shareWithGroup = group
        return databaseRepository.save(db)
    }

    @OptIn(ExperimentalStdlibApi::class)
    private fun getGroup(
        groupId: Int,
        userId: Int
    ): Group {
        val group = groupRepository.findById(groupId).getOrNull() ?: throw NotFoundException()
        if (group.users.find { it.userId == userId } == null) throw ForbiddenException("You are not allowed to access this group.")
        return group
    }

    @DeleteMapping("/{dbId}/share-with-group")
    @ResponseBody
    fun unsetPlaygroundShareWithGroup(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int
    ): SqlPlaygroundDatabase {
        val db =
            databaseRepository.findByOwner_IdAndIdAndDeleted(currentToken.id, dbId, false) ?: throw NotFoundException()
        db.shareWithGroup = null
        return databaseRepository.save(db)
    }

    @PostMapping("/{dbId}/reset")
    @ResponseBody
    @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
    fun reset(): Unit = Unit

    @PostMapping("/{dbId}/execute")
    @ResponseBody
    @ResponseStatus(HttpStatus.ACCEPTED)
    fun execute(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int,
        @RequestBody sqlQuery: SqlPlaygroundQueryCreation
    ): SqlPlaygroundQuery {
        val db = getDatabase(currentToken.id, dbId)
        val query = queryRepository.save(SqlPlaygroundQuery(sqlQuery.statement, db))
        sqlPlaygroundCheckerService.submit(query)
        return query
    }

    @GetMapping("/{dbId}/results")
    @ResponseBody
    fun getResults(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int
    ): List<SqlPlaygroundResult> {
        getDatabase(currentToken.id, dbId)
        return queryRepository.findByRunIn_id(dbId).mapNotNull { it.result }
    }

    @GetMapping("/{dbId}/results/{qId}")
    @ResponseBody
    fun getResult(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("dbId") dbId: Int,
        @PathVariable("qId") qId: Int
    ): SqlPlaygroundResult {
        getDatabase(currentToken.id, dbId)
        return queryRepository.findByRunIn_idAndId(dbId, qId)?.result
            ?: throw NotFoundException()
    }

    @GetMapping("/{dbId}/tables")
    @ResponseBody
    fun getTables(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "tables")

    @GetMapping("/{dbId}/constraints")
    @ResponseBody
    fun getConstrains(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "constraints")

    @GetMapping("/{dbId}/views")
    @ResponseBody
    fun getViews(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "views")

    @GetMapping("/{dbId}/routines")
    @ResponseBody
    fun getRoutines(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "routines")

    @GetMapping("/{dbId}/triggers")
    @ResponseBody
    fun getTriggers(@CurrentToken currentToken: LegacyToken, @PathVariable("dbId") dbId: Int): ArrayNode =
        getEntity(currentToken.id, dbId, "triggers")

    @GetMapping("/shared-with-group/{groupId}")
    @ResponseBody
    fun getByGroupId(
        @CurrentToken currentToken: LegacyToken,
        @PathVariable("groupId") groupId: Int
    ): SqlPlaygroundDatabase? {
        getGroup(groupId, currentToken.id)
        return databaseRepository.findByShareWithGroup(groupId)
    }

    private fun getEntity(userId: Int, databaseId: Int, type: String): ArrayNode {
        getDatabase(userId, databaseId)
        return entityRepository.findByDatabase_idAndDatabase_DeletedAndType(databaseId, false, type)?.data
            ?: throw NotFoundException()
    }

    private fun createAllEntities(database: SqlPlaygroundDatabase) =
        listOf("tables", "constraints", "views", "routines", "triggers").forEach { type ->
            entityRepository.save(SqlPlaygroundEntity(database, type, ArrayNode(JsonNodeFactory(false))))
        }

    private fun getDatabase(userId: Int, databaseId: Int): SqlPlaygroundDatabase {
        val database = databaseRepository.findByIdAndDeleted(databaseId, false) ?: throw NotFoundException()
        if (database.owner.id == userId) return database
        if (database.shareWithGroup?.users?.find { it.userId == userId } != null) return database
        throw NotFoundException()
    }
}
