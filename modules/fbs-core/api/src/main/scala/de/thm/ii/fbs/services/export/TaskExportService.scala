package de.thm.ii.fbs.services.`export`

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, CheckrunnerSubTask, Task}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, StorageService, TaskService}
import de.thm.ii.fbs.util.{Archiver, ScalaObjectMapper}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

import java.io.{BufferedWriter, File, FileWriter}
import scala.collection.mutable.ListBuffer

@Component
class TaskExportService {
  @Autowired
  private val taskService: TaskService = null
  @Autowired
  private val checkerConfigurationService: CheckrunnerConfigurationService = null
  @Autowired
  private val checkrunnerSubTaskService: CheckrunnerSubTaskService = null
  @Autowired
  private val storageService: StorageService = null
  private val objectMapper: ObjectMapper = new ScalaObjectMapper()


  def exportTask(taskId: Int): String = {
    val optionalTask = taskService.getOne(taskId)
    optionalTask match {
      case Some(task) =>
        val files: ListBuffer[String] = ListBuffer()
        val ccs = checkerConfigurationService.getAll(task.courseID, task.id)
        val export = TaskExport(task, ccs.map(cc => {
          val main = Option.when(cc.mainFileUploaded)({
            val filename = storageService.pathToMainFile(cc.id).get.toAbsolutePath.toString
            files += filename
            filename
          })
          val secondary = Option.when(cc.secondaryFileUploaded)({
            val filename = storageService.pathToSecondaryFile(cc.id).get.toAbsolutePath.toString
            files += filename
            filename
          })
          ConfigExport(cc, checkrunnerSubTaskService.getAll(cc.id), main, secondary)
        }
        ))
        val filename = f"/tmp/$taskId.json"
        val writer = new BufferedWriter(new FileWriter(filename))
        writer.write(objectMapper.writeValueAsString(export))
        writer.close()
        files += filename
        Archiver.compress(f"/tmp/export.tar.gz", files.map(f => new File(f)).toArray: _*)
        f"/tmp/export.tar.gz"
      case None => null // TODO ERROR
    }
  }

  case class TaskExport(task: Task, configs: List[ConfigExport])

  case class ConfigExport(config: CheckrunnerConfiguration, subTasks: List[CheckrunnerSubTask], mainFile: Option[String], secondaryFile: Option[String])

}

