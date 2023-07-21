package de.thm.ii.fbs.services.v2.persistence.storage

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.Submission
import de.thm.ii.fbs.model.v2.storageBucketName
import de.thm.ii.fbs.model.v2.storageFileName
import de.thm.ii.fbs.services.checker.trait.CheckerServiceOnDelete
import de.thm.ii.fbs.services.v2.checker.CheckerServiceFactoryService
import de.thm.ii.fbs.services.v2.persistence.TaskService
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Path
import java.util.Optional

@Component
class StorageService {
    @Autowired
    private val minioService: MinioService = null

    @Autowired
    lateinit var checkerService: CheckerServiceFactoryService

    @Autowired
    lateinit var taskService: TaskService

    @Autowired
    lateinit var fsStorageService: FsStorageService

    @Autowired
    lateinit var minioStorageService: MinioStorageService

    /**
     * gets the content of a the main File
     *
     * @param cc the Checkerunner Configuration
     */
    fun getMainFileContent(cc: CheckrunnerConfiguration): String {
        return if (cc.isInBlockStorage) {
            minioStorageService.getMainFileFromBucket(cc.id)
        } else {
            fsStorageService.getMainFile(cc.id)
        }
    }

    /**
     * gets the content of a the secondary File
     *
     * @param cc the Checkerunner Configuration
     */
    fun getSecondaryFileContent(cc: CheckrunnerConfiguration): String {
        return if (cc.isInBlockStorage) {
            minioStorageService.getSecondaryFileFromBucket(cc.id)
        } else {
            fsStorageService.getSecondaryFile(cc.id)
        }
    }

    /**
     * gets the content of a file depending on the source
     *
     * @param isInBlockStorage True if the content is the Minio
     * @param submissionId     submission id
     * @return
     */
    fun getSolutionFileContent(isInBlockStorage: Boolean, submissionId: Int): String {
        return if (isInBlockStorage) {
            minioStorageService.getSolutionFileFromBucket(submissionId)
        } else {
            fsStorageService.getSolutionFile(submissionId)
        }
    }

    /**
     * Deletes the configuration files from minio or FS and the DB entry
     *
     * @param tid task id
     * @param cid course id
     * @param cc  checker configuration
     * @throws IOException If the i/o operation fails
     * @return
     */
    @Throws(IOException::class)
    fun deleteAllConfigurations(tid: Int, cid: Int, cc: CheckrunnerConfiguration): Boolean {
        return try {
            if (cc.isInBlockStorage) {
                minioStorageService.deleteConfigurationFromBucket(cc.id)
            } else {
                fsStorageService.deleteConfiguration(cc.id)
            }
            notifyCheckerDelete(tid, cc)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * returns a main-file depending whether it is in the bucket or not
     *
     * @param config CheckrunnerConfiguration
     * @return
     */
    fun getFileMainFile(config: CheckrunnerConfiguration): File {
        return if (config.isInBlockStorage) {
            minioStorageService.getFileFromBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getMainFilePath(config.id))
        } else {
            fsStorageService.pathToMainFile(config.id).get().toFile()
        }
    }

    /**
     * returns a main-file depending whether it is in the bucket or not
     *
     * @param config CheckrunnerConfiguration
     * @return
     */
    fun getFileScondaryFile(config: CheckrunnerConfiguration): File {
        return if (config.isInBlockStorage) {
            minioStorageService.getFileFromBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getSecondaryFilePath(config.id))
        } else {
            fsStorageService.pathToSecondaryFile(config.id).get().toFile()
        }
    }

    /**
     * returns a secondary-file depending whether it is in the bucket or not
     *
     * @param submission the Submission
     * @return
     */
    fun getFileSolutionFile(submission: Submission): File {
        return if (submission.isInBlockStorage) {
            minioStorageService.getFileFromBucket(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submission.id))
        } else {
            fsStorageService.pathToSolutionFile(submission.id).get().toFile()
        }
    }

    /**
     * returns a String which represents the content type
     *
     * @param submission the Submission
     * @return
     */
    fun getContentTypeSolutionFile(submission: Submission): String {
        return if (submission.isInBlockStorage) {
            minioService.getStatsOfObject(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submission.id))
        } else {
            Files.probeContentType(fsStorageService.pathToSolutionFile(submission.id).get().toFile().toPath())
        }
    }

    /**
     * returns a input stream depending whether it is in the bucket or not
     *
     */
    fun getFileContentStream(pathFn: (Int) -> Optional<Path>, isInBlockStorage: Boolean, ccid: Int, fileName: String): InputStream {
        return if (isInBlockStorage) {
            ByteArrayInputStream(minioService.getObjectAsBytes(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getFilePath(ccid, fileName)))
        } else {
            val tmp = pathFn(ccid)
            if (tmp.isPresent) {
                FileInputStream(tmp.get().toFile())
            } else {
                throw NotFoundException()
            }
        }
    }

    private fun notifyCheckerDelete(tid: Int, cc: CheckrunnerConfiguration) {
        val checker = checkerService.apply(cc.checkerType)
        if (checker is CheckerServiceOnDelete)
         return when(checker) {
            is CheckerServiceOnDelete -> checker.onCheckerConfigurationDelete(taskService.getOne(tid), cc)
             else -> {}
         }
    }

    /**
     * Stores the Configuration File
     *
     * @param cc       the Check runner Configuration
     * @param file     the File to Store
     * @param fileName the name of the file
     */
    fun storeConfigurationFile(cc: CheckrunnerConfiguration, file: MultipartFile, fileName: String) {
        if (cc.isInBlockStorage) {
            minioStorageService.storeConfigurationFileInBucket(cc.id, file, fileName)
        } else {
            val tempDesc = Files.createTempFile("fbs", ".tmp")
            file.transferTo(tempDesc)
            fsStorageService.storeConfigurationFile(cc.id, tempDesc, fileName)
        }
    }

    fun deleteSolution(sid: Int): Boolean {
        return minioStorageService.deleteSolutionFileFromBucket(sid) || fsStorageService.deleteSolutionFile(sid)
    }
}
