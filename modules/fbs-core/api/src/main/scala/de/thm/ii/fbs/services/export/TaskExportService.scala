package de.thm.ii.fbs.services.`export`

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, CheckrunnerSubTask, Task}
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, StorageService, TaskService}
import de.thm.ii.fbs.util.{Archiver, ScalaObjectMapper}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.http.{MediaType, ResponseEntity}
import org.springframework.stereotype.Component

import java.io.{BufferedWriter, File, FileWriter}
import java.nio.file.{Files, Path, StandardOpenOption}
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

  private val tmpDir: File = new File("/tmp")
  private val logger = LoggerFactory.getLogger(this.getClass)


  def responseFromTaskId(taskId: Int): (Long, InputStreamResource) = {
    val file = exportTask(taskId)
    val contentLength = file.length()
    (contentLength, new InputStreamResource(Files.newInputStream(file.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
  }

  def exportTask(taskId: Int): File = {
    val optionalTask = taskService.getOne(taskId)
    optionalTask match {
      case Some(task) =>
        val files: ListBuffer[Archiver.ArchiveFile] = ListBuffer()
        val ccs = checkerConfigurationService.getAll(task.courseID, task.id)
        val export = TaskExport(task, ccs.map(cc => {
          val main = addCCFileAndGetName(cc, cc.mainFileUploaded, storageService.getFileMainFile, files)
          val secondary = addCCFileAndGetName(cc, cc.secondaryFileUploaded, storageService.getFileScondaryFile, files)
          ConfigExport(cc, checkrunnerSubTaskService.getAll(cc.id), main, secondary)
          /*val main = addCCFileAndGetName(cc.id, cc.mainFileUploaded, storageService.pathToMainFile, files)
            val secondary = addCCFileAndGetName(cc.id, cc.secondaryFileUploaded, storageService.pathToSecondaryFile, files)
            ConfigExport(cc, checkrunnerSubTaskService.getAll(cc.id), main, secondary)*/
        }))
        val descrFile = writeToTmpFile(taskId, export)
        // neues archive für jede task
        files += Archiver.ArchiveFile(descrFile, Option(f"task_$taskId.json"))
        val archive = File.createTempFile(s"task_$taskId-", ".fbs-export", tmpDir)
        Archiver.pack(archive, files.toArray: _*)
        descrFile.delete()
        archive
      case None => throw new ResourceNotFoundException(f"Could not export task with id = $taskId.")
    }
  }

  private def writeToTmpFile(taskId: Int, content: Object): File = {
    val descrFile = File.createTempFile(s"task_$taskId-", ".json", tmpDir)
    val writer = new BufferedWriter(new FileWriter(descrFile.toString))
    writer.write(objectMapper.writeValueAsString(content))
    writer.close()
    descrFile
  }

  private def addCCFileAndGetName(cc: CheckrunnerConfiguration, isUploaded: Boolean, getFile: CheckrunnerConfiguration => File,
                                  files: ListBuffer[Archiver.ArchiveFile]): Option[String] = {
    Option.when(isUploaded)({
      val filename = f"${cc.id}-${getFile(cc).getName}"
      files += Archiver.ArchiveFile(getFile(cc), Option(filename))
      filename
    })
  }

  case class TaskExport(task: Task, configs: List[ConfigExport])

  case class ConfigExport(config: CheckrunnerConfiguration, subTasks: List[CheckrunnerSubTask], mainFile: Option[String], secondaryFile: Option[String])
}
