package de.thm.ii.fbs.security.v2

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
}
