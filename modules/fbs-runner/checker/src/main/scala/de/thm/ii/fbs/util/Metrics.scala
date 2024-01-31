package de.thm.ii.fbs.util

import io.opentelemetry.exporter.prometheus.PrometheusHttpServer
import io.opentelemetry.sdk.OpenTelemetrySdk
import io.opentelemetry.sdk.metrics.SdkMeterProvider
import io.opentelemetry.sdk.resources.Resource

object Metrics {
  private val prometheusHttpServer = PrometheusHttpServer.builder().build()
  val openTelemetry: OpenTelemetrySdk = initOpenTelemetry()

  private def initOpenTelemetry(): OpenTelemetrySdk = {
    // Include required service.name resource attribute on all spans and metrics
    val resource = Resource.getDefault.merge(Resource.builder.put("service-name", "fbs-runner").build)
    val openTelemetrySdk = OpenTelemetrySdk.builder.setMeterProvider(
      SdkMeterProvider.builder.setResource(resource).registerMetricReader(prometheusHttpServer).build
    ).buildAndRegisterGlobal
    openTelemetrySdk
  }
}
