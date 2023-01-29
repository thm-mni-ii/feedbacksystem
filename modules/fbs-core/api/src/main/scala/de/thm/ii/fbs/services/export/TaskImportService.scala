package de.thm.ii.fbs.services.`export`

import com.fasterxml.jackson.databind.DeserializationFeature
import de.thm.ii.fbs.model.{TaskExport, TaskImportFiles, storageFileName}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, StorageService, TaskService}
import de.thm.ii.fbs.util.ScalaObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

import java.io.{File, FileInputStream}
import java.nio.file.Files

@Service
class TaskImportService {
  @Autowired
  private val storageService: StorageService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkrunnerSubTaskService: CheckrunnerSubTaskService = null
  val objectMapper = new ScalaObjectMapper
  private val logger = LoggerFactory.getLogger(this.getClass)

  def createTask(cid: Int, files: TaskImportFiles) {
    val t = objectMapper.readValue(new File(files.taskConfigPath), classOf[TaskExport])
    val task = taskService.create(cid, t.task)
    t.configs.foreach(cc => {
      logger.info(cc.toString)
      logger.info(cc.mainFile.toString)
      logger.info(cc.secondaryFile.toString)
      val id = checkerConfigurationService.create(cid, task.id, cc.config).id
      cc.subTasks.foreach(st => {
        checkrunnerSubTaskService.create(id, st.name, st.points)
      })
      storeFile(id, cc.mainFile, true)
      storeFile(id, cc.secondaryFile, false)
    })
  }

  def storeFile(id: Int, file: Option[String], isMain: Boolean): Unit = {
    file match {
      case Some(fileName) => {
        val newFile = new File(fileName)
        val contentType2: String = Files.probeContentType(newFile.toPath) match {
          case null => MediaType.APPLICATION_OCTET_STREAM.toString
          case value: String => value
        }
        if (isMain){
          storageService.storeConfigurationFileInBucket(id, new FileInputStream(newFile), newFile.length(),
            contentType2, storageFileName.MAIN_FILE)
        } else {
          storageService.storeConfigurationFileInBucket(id, new FileInputStream(newFile), newFile.length(),
            contentType2, storageFileName.SECONDARY_FILE)
        }
      }
      case None => {}
    }

  }
}
