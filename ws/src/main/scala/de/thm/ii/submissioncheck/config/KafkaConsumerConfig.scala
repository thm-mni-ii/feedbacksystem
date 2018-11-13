package de.thm.ii.submissioncheck.config

import java.util

import org.springframework.context.annotation.Configuration
import org.springframework.kafka.annotation.EnableKafka
import org.springframework.beans.factory.annotation.Value
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.common.serialization.StringDeserializer
import org.springframework.context.annotation.Bean
import org.springframework.kafka.core.ConsumerFactory
import org.springframework.kafka.core.DefaultKafkaConsumerFactory
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory
import org.springframework.kafka.support.serializer.JsonDeserializer

/**
  * Kafka default consumer configuration for a docker instance.
  *
  * @author Andrej Sajenko
  */
@EnableKafka
@Configuration
class KafkaConsumerConfig {
  @Value("${spring.kafka.bootstrap-servers}")
  private var bootstrapAddress: String = null

  @Value("${spring.kafka.consumer.group-id}")
  private var groupId: String = null

  /**
    * @return Default kafka consumer config for a docker instance.
    */
  @Bean
  def consumerFactory: ConsumerFactory[String, String] = {
    val props = new util.HashMap[String, Object]()
    props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapAddress)
    props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId)
    props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true")
    props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "100")
    props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "15000")
    props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, classOf[StringDeserializer])
    props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, classOf[JsonDeserializer[String]])
    new DefaultKafkaConsumerFactory(props)
  }

  /**
    * @return Default kafka consumer listener factory.
    */
  @Bean
  def kafkaListenerContainerFactory: ConcurrentKafkaListenerContainerFactory[String, String] = {
    val factory = new ConcurrentKafkaListenerContainerFactory[String, String]
    factory.setConsumerFactory(consumerFactory)
    factory
  }
}
