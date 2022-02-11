package de.thm.ii.fbs.services.persistence

import de.thm.ii.fbs.model.SQLCheckerQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria.where
import org.springframework.data.mongodb.core.query.Query.query
import org.springframework.stereotype.Component

import scala.jdk.javaapi.CollectionConverters

@Component
class SQLCheckerService {
  @Autowired
  private val mongodbTemplate: MongoTemplate = null

  def getQueriesForTask(taskID: Int): Seq[SQLCheckerQuery] = {
    val queryQuery = query(where("taskNumber").is(taskID))
    val resultList = mongodbTemplate.find(queryQuery, classOf[SQLCheckerQuery], "Queries")
    CollectionConverters.asScala(resultList).toSeq
  }
}
