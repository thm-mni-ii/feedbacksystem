package de.thm.ii.fbs.services.v2.persistence

import org.junit.After
import org.junit.Before
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mock.web.MockMultipartFile
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.FileInputStream


class MinioServiceTest {
    @Autowired
    lateinit var minioServiceV2: MinioServiceV2


    @Before
    fun initialMinio(): Unit {
        minioServiceV2.initialMinio()
    }

    @Test
    fun testString() {
        val str = "Hello World"
        val file = File("test.txt")
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        val multipartFile: MultipartFile = MockMultipartFile("test.txt", FileInputStream(file))
        minioServiceV2.createBucketIfNotExists("test")
        minioServiceV2.putObject(multipartFile, "test.txt", "test")
        file.delete()
        val obj = minioServiceV2.getObjectAsString("test", "test.txt")
        assert(obj == str)
    }

    @Test
    fun testBytes() {
        val str = "Hello World"
        minioServiceV2.createBucketIfNotExists("test")
        val obj = minioServiceV2.getObjectAsBytes("test", "test.txt")
        assert(obj.contentEquals(str.toByteArray().toTypedArray()))
    }

    @Test
    fun testFile() {
        val str = "Hello World"
        val file = File("test.txt")
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        minioServiceV2.createBucketIfNotExists("test")
        val obj = minioServiceV2.getObjectAsFile("test", "test.txt")
        // compare content
        assert(obj.get(file))
        file.delete()
    }

    @After
    fun deleteFile(): Unit {
        minioServiceV2.deleteObject("test", "test.txt")
    }
}