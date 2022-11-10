package de.thm.ii.fbs.services.v2.messaging

import org.springframework.context.ApplicationContext

class MessageServiceFactory(
    private val context: ApplicationContext,
) {
    operator fun invoke(): MessageServiceInterface =
        context.getBean(InMemoryMessageService::class.java)
}
