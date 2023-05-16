package de.thm.ii.fbs.services.v2.persistence

import org.apache.commons.io.FileUtils
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.FileInputStream

@SpringBootTest
class MinioServiceTest {
    @Autowired
    lateinit var minioServiceV2: MinioServiceV2
    val str = "Hello World"

    @Before
    fun initialMinio(): Unit {
        minioServiceV2.initialMinio()
        val file = File("test.txt")
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        val multipartFile: MultipartFile = MockMultipartFile("test.txt", FileInputStream(file))
        minioServiceV2.createBucketIfNotExists("test")
        minioServiceV2.putObject(multipartFile, "test.txt", "test")
        file.delete()
    }

    @Test
    fun testString() {
        val obj = minioServiceV2.getObjectAsString("test", "test.txt")
        assert(obj == str)
    }

    @Test
    fun testBytes() {
        val obj = minioServiceV2.getObjectAsBytes("test", "test.txt")
        assert(obj.contentEquals(str.toByteArray().toTypedArray()))
    }

    @Test
    fun testFile() {
        val file = File("test.txt")
        file.bufferedWriter().use { out ->
            out.write(str)
        }
        val obj = minioServiceV2.getObjectAsFile("test", "test.txt")
        // compare content
        assert(FileUtils.contentEquals(obj, file))
        file.delete()
    }

    @After
    fun deleteFile(): Unit {
        minioServiceV2.deleteObject("test", "test.txt")
    }
}
