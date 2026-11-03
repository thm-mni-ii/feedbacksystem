package de.thm.ii.fbs.util

import org.apache.hc.client5.http.impl.classic.HttpClients
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder
import org.apache.hc.client5.http.ssl.{NoopHostnameVerifier, SSLConnectionSocketFactoryBuilder, TrustSelfSignedStrategy}
import org.apache.hc.core5.ssl.SSLContextBuilder
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory
import org.springframework.web.client.RestTemplate

/**
  * RestTemplateFactory
  */
object RestTemplateFactory {
  /**
    * Create default RestTemplate.
    * @param insecure if the RestTemplate allows insecure connections (with self-signed certificates)
    * @return a RestTemplate instance.
    */
  def makeRestTemplate(insecure: Boolean): RestTemplate = {
    val requestFactory = new HttpComponentsClientHttpRequestFactory()
    if (insecure) {
      val sslContext = new SSLContextBuilder().loadTrustMaterial(null, new TrustSelfSignedStrategy).build()
      val socketFactory = SSLConnectionSocketFactoryBuilder.create()
        .setSslContext(sslContext)
        .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
        .build()
      val connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
        .setSSLSocketFactory(socketFactory)
        .build()
      requestFactory.setHttpClient(HttpClients.custom.setConnectionManager(connectionManager).build())
    }
    new RestTemplate(requestFactory)
  }
}
