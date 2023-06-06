package de.thm.ii.fbs.services.v2.persistence.storage

import de.thm.ii.fbs.model.v2.storageBucketName
import de.thm.ii.fbs.model.v2.storageFileName
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.util.Optional
import kotlin.io.path.deleteIfExists

@Component
class FsStorageService {
    @Value("\$storage.uploadDir")
    lateinit var uploadDir: String

    private fun uploadDirPath(): Path = Path.of(uploadDir)

    private fun tasksDir(tid: Int) = uploadDirPath().resolve(storageBucketName.CHECKER_CONFIGURATION_FOLDER).resolve(tid.toString())

    private fun submissionDir(sid: Int) = uploadDirPath().resolve(storageBucketName.SUBMISSIONS_BUCKET).resolve(sid.toString())

    fun getFileContent(path: Optional<Path>): String {
        return if (path.isPresent) {
            path.get().toFile().bufferedReader().use { it.readText() }
        } else {
            ""
        }
    }

    @Throws(IOException::class)
    fun storeConfigurationFile(tid: Int, src: Path, fileName: String) =
            Files.move(src, Files.createDirectories(tasksDir(tid)).resolve(fileName), StandardCopyOption.REPLACE_EXISTING)

    /**
     * Store (replace if exists) the solution file a submission
     *
     * @param sid Submission id
     * @param src Current path to the file
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun storeSolutionFile(sid: Int, src: Path) =
            Files.move(src, Files.createDirectories(submissionDir(sid)).resolve(storageFileName.SOLUTION_FILE), StandardCopyOption.REPLACE_EXISTING)

    /**
     * Get the path to the main file of a task
     *
     * @param tid Task id
     * @return The path to the file
     */
    fun pathToMainFile(tid: Int): Optional<Path> = Optional.of(tasksDir(tid).resolve(storageFileName.MAIN_FILE))

    /**
     * Get the path to the secondary file of a task
     *
     * @param tid Task id
     * @return The path to the file
     */
    fun pathToSecondaryFile(tid: Int): Optional<Path> = Optional.of(tasksDir(tid).resolve(storageFileName.SECONDARY_FILE))

    /**
     * Get the path to the solution file of a submission
     *
     * @param sid Submission id
     * @return The path to the file
     */
    fun pathToSolutionFile(sid: Int): Optional<Path> = Optional.of(submissionDir(sid).resolve(storageFileName.SOLUTION_FILE))

    /**
     * Gets the Content of the solution file
     *
     * @param sid Submission id
     * @return The Solution file content
     */
    fun getSolutionFile(sid: Int): String = getFileContent(pathToSolutionFile(sid))

    /**
     * Gets the Content of the main file
     *
     * @param ccid Checkrunner id
     * @return The Solution file content
     */
    fun getMainFile(ccid: Int): String = getFileContent(pathToMainFile(ccid))

    /**
     * Gets the Content of the secondary file
     *
     * @param ccid Checkrunner id
     * @return The Solution file content
     */
    fun getSecondaryFile(ccid: Int): String = getFileContent(pathToSecondaryFile(ccid))

    /**
     * Delete a main file
     *
     * @param tid Task id
     * @return True if deteled, false if not file exists
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteMainFile(tid: Int): Boolean {
        val tmp = pathToMainFile(tid)
        if (tmp.isPresent) {
            return tmp.get().deleteIfExists()
        }
        throw NotFoundException()
    }

    /**
     * Delete a secondary file
     *
     * @param tid Task id
     * @return True if deteled, false if not file exists
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteSecondaryFile(tid: Int): Boolean {
        val tmp = pathToSecondaryFile(tid)
        if (tmp.isPresent) {
            return tmp.get().deleteIfExists()
        }
        throw NotFoundException()
    }

    /**
     * Delete the Configuration Folder with all Files inside
     *
     * @param tid Task id
     * @return True if deteled, false if not Directory exists
     * @throws IOException If the i/o operation fails
     */
    fun deleteConfiguration(tid: Int): Boolean
    {
        return deleteFolder(tasksDir(tid))
    }

    /**
     * Delete a solution file
     *
     * @param sid Submission id
     * @return True if deteled, false if not file exists
     * @throws IOException If the i/o operation fails
     */
    @Throws(IOException::class)
    fun deleteSolutionFile(sid: Int): Boolean = deleteFolder(submissionDir(sid))

    private fun deleteFolder(path: Path): Boolean {
        val confDir = path.toFile()

        return if (confDir.exists() && confDir.isDirectory) {
            FileUtils.deleteDirectory(confDir)
            true
        } else {
            false
        }
    }
}
