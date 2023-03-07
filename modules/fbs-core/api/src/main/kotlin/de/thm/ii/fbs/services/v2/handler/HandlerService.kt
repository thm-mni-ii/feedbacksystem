package de.thm.ii.fbs.services.v2.handler


import de.thm.ii.fbs.utils.v2.handler.Handler
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When
import kotlin.reflect.full.findAnnotations

class HandlerService<In, Out>(private vararg val handlers: Handler<In, Out>) {
    fun getAllHandlers(): Collection<Handler<In, Out>> {
        return handlers.toList()
    }

    fun getHandlers(vararg executions: When): Collection<Handler<In, Out>> {
        if (executions.isNotEmpty())
            return handlers.filter { handler ->
                handler::class.findAnnotations(Handle::class).any { ann -> executions.contains(ann.execution) }
            }
        return emptyList()
    }

    fun runHandlers(input: In, vararg executions: When): Collection<Out> {
        return getHandlers(*executions).map { handler ->
            handler.handle(input)
        }
    }
}