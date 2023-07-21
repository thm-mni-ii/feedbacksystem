package de.thm.ii.fbs.services.v2.persistence.storage

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.storageBucketName
import de.thm.ii.fbs.model.v2.storageFileName
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.IOException
import java.util.Optional

@Component
class MinioStorageService {
    @Autowired
    lateinit var minioService: MinioService

    /**
     * Store (replace if exists) the solution file a submission
     *
     * @param sid  Submission id
     * @param file the file
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun storeSolutionFileInBucket(sid: Int, file: MultipartFile): Unit =
            minioService.putObject(file, storageFileName.getSolutionFilePath(sid), storageBucketName.SUBMISSIONS_BUCKET)

    @Throws(IOException::class)
    fun storeConfigurationFileInBucket(ccid: Int, file: MultipartFile, fileName: String): Unit =
            minioService.putObject(file, storageFileName.getFilePath(ccid, fileName), storageBucketName.CHECKER_CONFIGURATION_BUCKET)

    fun getFileContentBucket(bucketName: String, id: Int, fileName: String): String {
        return minioService.getObjectAsString(bucketName, "$id/$fileName")
    }

    fun getFileFromBucket(bucketName: String, objName: String): File =
            minioService.getObjectAsFile(bucketName, objName)

    /**
     * Gets the Content of the solution file
     *
     * @param sid Submission id
     * @return The Solution file content
     */
    fun getSolutionFileFromBucket(sid: Int): String = getFileContentBucket(storageBucketName.SUBMISSIONS_BUCKET, sid, storageFileName.SOLUTION_FILE)

    /**
     * Gets the Content of the main file
     *
     * @param ccid Checkrunner id
     * @return The Solution file content
     */
    fun getMainFileFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.MAIN_FILE)

    /**
     * Gets the Content of the secondary file
     *
     * @param ccid Checkrunner id
     * @return The Solution file content
     */
    fun getSecondaryFileFromBucket(ccid: Int): String = getFileContentBucket(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid, storageFileName.SECONDARY_FILE)

    /**
     * Delete the Configuration Folder with all Files inside
     *
     * @param ccid Checker Configuration id
     * @return True if deteled, false if not Directory exists
     * @throws IOException If the i/o operation fails
     */
    fun deleteConfigurationFromBucket(ccid: Int): Unit {
        minioService.deleteFolder(storageBucketName.CHECKER_CONFIGURATION_BUCKET, ccid.toString)
    }

    /**
     * Delete a solution file
     *
     * @param sid Submission id
     * @return True if deteled, false if not file exists
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteSolutionFileFromBucket(sid: Int): Boolean {
        return try {
            minioService.deleteFolder(storageBucketName.SUBMISSIONS_BUCKET, sid.toString)
            true
        } catch (_: Throwable) {
            false
        }
    }

    fun urlToSolutionFile(submissionID: Int): String {
        return minioService.generatePresignedGetUrl(storageBucketName.SUBMISSIONS_BUCKET, storageFileName.getSolutionFilePath(submissionID))
    }

    fun urlToMainFile(cc: CheckrunnerConfiguration): Optional<String> {
        return if (cc.mainFileUploaded) {
            val url = minioService.generatePresignedGetUrl(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getMainFilePath(cc.id))
            Optional.of(url)
        } else {
            Optional.empty<String>()
        }
    }

    fun urlToSecondaryFile(cc: CheckrunnerConfiguration): Optional<String> {
        return if (cc.secondaryFileUploaded) {
            val url = minioService.generatePresignedGetUrl(storageBucketName.CHECKER_CONFIGURATION_BUCKET, storageFileName.getSecondaryFilePath(cc.id))
            Optional.of(url)
        } else {
            Optional.empty<String>()
        }
    }
}
