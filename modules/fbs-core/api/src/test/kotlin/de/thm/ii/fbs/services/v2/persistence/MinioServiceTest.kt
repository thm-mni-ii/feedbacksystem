package de.thm.ii.fbs.services.v2.persistence

import org.apache.commons.io.FileUtils
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.springframework.mock.web.MockMultipartFile
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.FileInputStream

class MinioServiceTest {
    lateinit var minioServiceV2: MinioServiceV2
    val str = "Hello World"
    val filename = "test.txt"

    @Before
    fun initialMinio() {
        minioServiceV2 = MinioServiceV2()
        minioServiceV2.initialMinio()
        val file = File(filename)
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        val multipartFile: MultipartFile = MockMultipartFile(filename, FileInputStream(file))
        minioServiceV2.createBucketIfNotExists("test")
        minioServiceV2.putObject(multipartFile, filename, "test")
    }

    @Test
    fun testString() {
        val obj = minioServiceV2.getObjectAsString("test", filename)
        assert(obj == str)
    }

    @Test
    fun testBytes() {
        val obj = minioServiceV2.getObjectAsBytes("test", filename)
        assert(obj.contentEquals(str.toByteArray().toTypedArray()))
    }

    @Test
    fun testFile() {
        val file = File(filename)
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        val obj = minioServiceV2.getObjectAsFile("test", filename)
        // compare content
        assert(FileUtils.contentEquals(obj, file))
        file.delete()
    }

    @After
    fun deleteFile() {
        val file = File(filename)
        minioServiceV2.deleteObject("test", filename)
        file.delete()
    }
}
