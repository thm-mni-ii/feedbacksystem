package de.thm.ii.fbs.security.v2

import java.util.Date
import org.junit.Assert
import org.junit.Test

class AntiBruteForceInterceptorTest {
    @Test
    fun noProxy() {
        val abfi = AntiBruteForceInterceptor()
        Assert.assertEquals("10.44.0.2", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2")))
    }

    @Test
    fun oneProxy() {
        val abfi = AntiBruteForceInterceptor(trustedProxyCount = 1)
        Assert.assertEquals("10.44.0.1", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2")))
        Assert.assertEquals("10.44.0.2", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2", "10.44.0.3")))
    }

    @Test
    fun twoProxy() {
        val abfi = AntiBruteForceInterceptor(trustedProxyCount = 2)
        Assert.assertEquals(null, abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2")))
        Assert.assertEquals("10.44.0.1", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2", "10.44.0.3")))
        Assert.assertEquals("10.44.0.2", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2", "10.44.0.3", "10.44.0.4")))
    }

    @Test
    fun oneProxyWithTrustedIps() {
        val abfi = AntiBruteForceInterceptor(trustedProxyCount = 1, allowListString = "10.44.0.4,10.44.0.44")
        Assert.assertEquals("10.44.0.1", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2")))
        Assert.assertEquals("10.44.0.2", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.2", "10.44.0.3")))
        Assert.assertEquals("10.44.0.1", abfi.getRealIp(listOf("10.44.0.1", "10.44.0.4", "10.44.0.3")))
    }

    @Test
    fun cleanIfNeededHandlesMultipleExpiredLogins() {
        val abfi = AntiBruteForceInterceptor(interval = 1)
        val expiredDate = Date(System.currentTimeMillis() - 2000)
        val loginAttemptsClass = Class.forName("${AntiBruteForceInterceptor::class.java.name}\$LoginAttempts")
        val loginAttemptsConstructor = loginAttemptsClass.getDeclaredConstructor(
            Int::class.javaPrimitiveType!!,
            Date::class.java
        )
        loginAttemptsConstructor.isAccessible = true
        val expiredLoginAttempts = loginAttemptsConstructor.newInstance(1, expiredDate)

        val loginsField = AntiBruteForceInterceptor::class.java.getDeclaredField("logins")
        loginsField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val logins = loginsField.get(abfi) as MutableMap<String, Any>
        logins["10.44.0.1"] = expiredLoginAttempts
        logins["10.44.0.2"] = expiredLoginAttempts

        val lastCleanField = AntiBruteForceInterceptor::class.java.getDeclaredField("lastClean")
        lastCleanField.isAccessible = true
        lastCleanField.set(abfi, expiredDate)

        val cleanIfNeeded = AntiBruteForceInterceptor::class.java.getDeclaredMethod("cleanIfNeeded")
        cleanIfNeeded.isAccessible = true
        cleanIfNeeded.invoke(abfi)

        Assert.assertTrue(logins.isEmpty())
    }
}
