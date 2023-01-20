package de.thm.ii.fbs.services.`export`

import com.fasterxml.jackson.databind.DeserializationFeature
import de.thm.ii.fbs.model.{TaskExport, TaskImportFiles, storageFileName}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, StorageService, TaskService}
import de.thm.ii.fbs.util.ScalaObjectMapper
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

  def createTask(cid: Int, files: TaskImportFiles) {
    val t = objectMapper.readValue(new File(files.taskConfigPath), classOf[TaskExport])
    val task = taskService.create(cid, t.task)
    t.configs.foreach(cc => {
      val id = checkerConfigurationService.create(cid, task.id, cc.config).id
      cc.subTasks.foreach(st => {
        checkrunnerSubTaskService.create(id, st.name, st.points)
      })
      storeFile(id, cc.mainFile)
      storeFile(id, cc.secondaryFile)
    })
  }

  def storeFile(id: Int, file: Option[String]): Unit = {
    file match {
      case Some(fileName) => {
        val newFile = new File(fileName)
        val contentType2: String = Files.probeContentType(newFile.toPath) match {
          case null => MediaType.APPLICATION_OCTET_STREAM.toString
          case value: String => value
        }
        storageService.storeConfigurationFileInBucket(id, new FileInputStream(newFile), newFile.length(),
          contentType2, storageFileName.SECONDARY_FILE)
      }
      case None => {}
    }

  }
}
