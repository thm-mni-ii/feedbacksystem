package de.thm.ii.submissioncheck.config

import java.util

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.apache.kafka.clients.producer.ProducerConfig
import org.apache.kafka.common.serialization.StringSerializer
import org.springframework.kafka.core.{DefaultKafkaProducerFactory, KafkaTemplate, ProducerFactory}
import org.springframework.context.annotation.Bean


@Configuration
class KafkaProducerConfig {

  @Value("${spring.kafka.bootstrap-servers}") private val bootstrapAddress: String = null

  @Bean def producerFactory: ProducerFactory[String, String] = {
    val configProps = new util.HashMap[String, Object]()
    configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress)
    configProps.put(ProducerConfig.RETRIES_CONFIG, "0")
    configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, "16384")
    configProps.put(ProducerConfig.LINGER_MS_CONFIG, "1")
    configProps.put(ProducerConfig.BUFFER_MEMORY_CONFIG, "33554432")
    configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer])
    configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, classOf[StringSerializer])
    new DefaultKafkaProducerFactory(configProps)
  }

  @Bean def kafkaTemplate: KafkaTemplate[String, String] = new KafkaTemplate(producerFactory)
}
