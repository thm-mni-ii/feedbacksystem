package de.thm.ii.fbs.config

import java.security.Principal

import de.thm.ii.fbs.model.UserSessionMap
import de.thm.ii.fbs.services.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.{Bean, Configuration, Primary}
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.messaging.simp.config.{ChannelRegistration, MessageBrokerRegistry}
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.simp.user.{DefaultUserDestinationResolver, SimpUserRegistry, UserDestinationResolver}
import org.springframework.messaging.support.{ChannelInterceptor, MessageBuilder}
import org.springframework.messaging.{Message, MessageChannel, MessagingException}
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.config.annotation.{EnableWebSocketMessageBroker, StompEndpointRegistry, WebSocketMessageBrokerConfigurer}
import org.springframework.web.socket.messaging._

/**
  * WebSocket broker for tickets
  */
@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig extends WebSocketMessageBrokerConfigurer {
  private val registry: DefaultSimpUserRegistry = new DefaultSimpUserRegistry();
  private val resolver: DefaultUserDestinationResolver = new DefaultUserDestinationResolver(registry);
  @Autowired
  private val userService: UserService = null
  /**
    * @return Default user registry.
    */
  @Bean
  @Primary
  def userRegistry(): SimpUserRegistry = registry

  /**
    * @return Default user destination resolver.
    */
  @Bean
  @Primary
  def userDestinationResolver(): UserDestinationResolver = resolver

  /**
    * Register endpoints
    * @param registry Endpoint registry
    */
  override def registerStompEndpoints(registry: StompEndpointRegistry): Unit = {
    registry.addEndpoint("/websocket")
      .setAllowedOrigins("*")
      .withSockJS()
      .setWebSocketEnabled(true)
      .setSessionCookieNeeded(false)
  }

  /**
    * Register message broker
    * @param registry broker registry
    */
  override def configureMessageBroker(registry: MessageBrokerRegistry): Unit = {
    registry.setApplicationDestinationPrefixes("/websocket")
    registry.enableSimpleBroker("/user", "/topic")
  }

  /**
    * @param registration Hockup on the client inbound channel.
    */
  override def configureClientInboundChannel(registration: ChannelRegistration): Unit = {
    registration.interceptors(new JWTAuthenticationChannelInterceptor(registry, userService))
  }
}

/**
  * JWT authentication
  * @param registry User registry
  * @param userService User service
  */
class JWTAuthenticationChannelInterceptor(registry: DefaultSimpUserRegistry, userService: UserService) extends ChannelInterceptor {
  /**
    * Hockup for jwt authentication.
    * @param message Message
    * @param channel Channel
    * @return Passed messages
    */
  override def preSend(message: Message[_], channel: MessageChannel): Message[_] = {
    val accessor = StompHeaderAccessor.wrap(message)
    if (accessor.getMessageType == SimpMessageType.DISCONNECT) {
      UserSessionMap.delete(accessor.getSessionId)
      registry.onApplicationEvent(new SessionDisconnectEvent(this, message.asInstanceOf[Message[Array[Byte]]], accessor.getSessionId, CloseStatus.NORMAL))
      message
    } else {
      val jwtToken = accessor.getFirstNativeHeader("Auth-Token")

      if (jwtToken == null) {
        throw new MessagingException("Not authenticated!")
      }

      val userOpt = userService.verifyUserByTocken(jwtToken)
      if (userOpt.isEmpty) {
        throw new MessagingException("Not authenticated: Invalid token.")
      }

      val principal: Principal = userOpt.get

      accessor.setUser(principal)
      accessor.setLeaveMutable(true)

      if (accessor.getMessageType == SimpMessageType.CONNECT) {
        UserSessionMap.map(accessor.getSessionId, principal)
      }

      if (accessor.getMessageType match {
        case SimpMessageType.CONNECT | SimpMessageType.SUBSCRIBE | SimpMessageType.UNSUBSCRIBE => true
        case _ => false
      }) {
        registry.onApplicationEvent(accessor.getMessageType match {
          case SimpMessageType.CONNECT => new SessionConnectedEvent(this, message.asInstanceOf[Message[Array[Byte]]], principal)
          case SimpMessageType.SUBSCRIBE => new SessionSubscribeEvent(this, message.asInstanceOf[Message[Array[Byte]]], principal)
          case SimpMessageType.UNSUBSCRIBE => new SessionUnsubscribeEvent(this, message.asInstanceOf[Message[Array[Byte]]], principal)
        })
      }
      MessageBuilder.createMessage(message.getPayload, accessor.getMessageHeaders)
    }
  }
}
