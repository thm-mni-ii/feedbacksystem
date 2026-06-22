package de.thm.ii.fbs.services.`export`

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.controller.exception.ResourceNotFoundException
import de.thm.ii.fbs.model.task.Task
import de.thm.ii.fbs.model.{CheckrunnerConfiguration, CheckrunnerSubTask, storageFileName}
import de.thm.ii.fbs.services.persistence.storage.StorageService
import de.thm.ii.fbs.services.persistence.{CheckrunnerConfigurationService, CheckrunnerSubTaskService, TaskService}
import de.thm.ii.fbs.util.{Archiver, ScalaObjectMapper}
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.InputStreamResource
import org.springframework.stereotype.Component

import java.io.{BufferedWriter, File, FileWriter}
import java.nio.file.{Files, StandardOpenOption}
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

  def responseFromTaskId(tasks: List[Task]): (Long, InputStreamResource) = {
    val file: File = exportTasks(tasks)
    val contentLength = file.length()
    (contentLength, new InputStreamResource(Files.newInputStream(file.toPath, StandardOpenOption.DELETE_ON_CLOSE)))
  }

  def exportTasks(tasks: List[Task]): File = {
    val archive = File.createTempFile(s"task-", ".fbs-export", tmpDir)
    val files: ListBuffer[ListBuffer[Archiver.ArchiveFile]] = ListBuffer()
    tasks.foreach(task => {
      val filesForTask: ListBuffer[Archiver.ArchiveFile] = ListBuffer()
      val optionalTask = taskService.getOne(task.id)
      optionalTask match {
        case Some(task) =>
          val ccs = checkerConfigurationService.getAll(task.courseID, task.id)
          val `export` = TaskExport(task, ccs.map(cc => {
            val main = addCCFileAndGetName(cc, cc.mainFileUploaded, storageService.getFileMainFile, storageFileName.MAIN_FILE, filesForTask)
            val secondary = addCCFileAndGetName(cc, cc.secondaryFileUploaded, storageService.getFileSecondaryFile, storageFileName.SECONDARY_FILE, filesForTask)
            ConfigExport(cc, checkrunnerSubTaskService.getAll(cc.id), main, secondary)
          }))
          val descrFile = writeToTmpFile(task.id, `export`)
          filesForTask += Archiver.ArchiveFile(descrFile, Option(f"task_config.json"))
        case None => throw new ResourceNotFoundException(f"Could not export task with id = $task.id.")
      }
      files += filesForTask
    })
    Archiver.packDir(tasks, archive, files)
    archive
  }

  private def writeToTmpFile(taskId: Int, content: Object): File = {
    val descrFile = File.createTempFile(s"task_$taskId-", ".json", tmpDir)
    val writer = new BufferedWriter(new FileWriter(descrFile.toString))
    writer.write(objectMapper.writeValueAsString(content))
    writer.close()
    descrFile
  }

  private def addCCFileAndGetName(cc: CheckrunnerConfiguration, isUploaded: Boolean, getFile: CheckrunnerConfiguration => File,
                                  fileName: String, files: ListBuffer[Archiver.ArchiveFile]): Option[String] = {
    Option.when(isUploaded)({
      val filename = f"${cc.id}-$fileName"
      files += Archiver.ArchiveFile(getFile(cc), Option(filename))
      filename
    })
  }

  case class TaskExport(task: Task, configs: List[ConfigExport])

  case class ConfigExport(config: CheckrunnerConfiguration, subTasks: List[CheckrunnerSubTask], mainFile: Option[String], secondaryFile: Option[String])
}
