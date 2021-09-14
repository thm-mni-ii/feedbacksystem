package de.thm.ii.fbs.util

import org.apache.http.conn.ssl.{NoopHostnameVerifier, SSLConnectionSocketFactory, TrustSelfSignedStrategy}
import org.apache.http.impl.client.HttpClients
import org.apache.http.ssl.SSLContextBuilder
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
      val sslContextBuilder = new SSLContextBuilder()
      sslContextBuilder.loadTrustMaterial(null, new TrustSelfSignedStrategy)
      val socketFactory = new SSLConnectionSocketFactory(sslContextBuilder.build, NoopHostnameVerifier.INSTANCE)
      val httpClient = HttpClients.custom.setSSLSocketFactory(socketFactory).build()
      requestFactory.setHttpClient(httpClient)
    }
    new RestTemplate(requestFactory)
  }
}
