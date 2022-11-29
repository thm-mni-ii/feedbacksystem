package de.thm.ii.fbs.utils.v2.helpers

import org.apache.http.conn.ssl.NoopHostnameVerifier
import org.apache.http.conn.ssl.SSLConnectionSocketFactory
import org.apache.http.conn.ssl.TrustSelfSignedStrategy
import org.apache.http.impl.client.HttpClients
import org.apache.http.ssl.SSLContextBuilder
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

object RestTemplateFactory {
    fun makeRestTemplate(insecure: Boolean): RestTemplate {
        val requestFactory = HttpComponentsClientHttpRequestFactory()
        if (insecure) {
            val sslContextBuilder = SSLContextBuilder()
            sslContextBuilder.loadTrustMaterial(null, TrustSelfSignedStrategy())
            val socketFactory = SSLConnectionSocketFactory(sslContextBuilder.build(), NoopHostnameVerifier.INSTANCE)
            val httpClient = HttpClients.custom().setSSLSocketFactory(socketFactory).build()
            requestFactory.httpClient = httpClient
        }
        return RestTemplate(requestFactory)
    }
}
