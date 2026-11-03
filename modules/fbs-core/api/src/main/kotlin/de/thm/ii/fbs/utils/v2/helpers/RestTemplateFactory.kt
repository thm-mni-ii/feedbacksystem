package de.thm.ii.fbs.utils.v2.helpers

import org.apache.hc.client5.http.impl.classic.HttpClients
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder
import org.apache.hc.client5.http.ssl.TrustSelfSignedStrategy
import org.apache.hc.core5.ssl.SSLContextBuilder
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

object RestTemplateFactory {
    fun makeRestTemplate(insecure: Boolean): RestTemplate {
        val requestFactory = HttpComponentsClientHttpRequestFactory()
        if (insecure) {
            val sslContext = SSLContextBuilder().loadTrustMaterial(null, TrustSelfSignedStrategy()).build()
            val socketFactory = SSLConnectionSocketFactoryBuilder.create()
                .setSslContext(sslContext)
                .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                .build()
            val connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                .setSSLSocketFactory(socketFactory)
                .build()
            requestFactory.httpClient = HttpClients.custom().setConnectionManager(connectionManager).build()
        }
        return RestTemplate(requestFactory)
    }
}
