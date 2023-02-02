package de.thm.ii.fbs.services.v2.checker.excel

import de.thm.ii.fbs.handler.TestAfterHandler
import de.thm.ii.fbs.handler.TestBeforeHandler
import de.thm.ii.fbs.handler.TestNoHandler
import de.thm.ii.fbs.handler.TestOnHandler
import de.thm.ii.fbs.services.v2.handler.HandlerService
import de.thm.ii.fbs.utils.v2.handler.When
import org.junit.Test
import org.junit.jupiter.api.Assertions.*

class HandlerServiceTest {
    private val beforeHandler = TestBeforeHandler()
    private val afterHandler = TestAfterHandler()
    private val onHandler = TestOnHandler()
    private val noHandler = TestNoHandler()

    private val handlers = arrayOf(beforeHandler, afterHandler, onHandler, noHandler)
    private val service = HandlerService(*handlers)

    @Test
    fun testGetAll() {
        assertEquals(handlers.toList(), service.getAllHandlers())
    }

    @Test
    fun testGetBefore() {
        assertEquals(listOf(beforeHandler), service.getHandlers(When.BEFORE))
    }

    @Test
    fun testGetAfter() {
        assertEquals(listOf(afterHandler), service.getHandlers(When.AFTER))
    }

    @Test
    fun testGetOn() {
        //assertEquals(listOf(onHandler), service.getHandlers(When.ONERROR))
        assertEquals(listOf(onHandler), service.getHandlers(When.ONVISIT))
        //assertEquals(listOf(onHandler), service.getHandlers(When.ONERROR, When.ONVISIT))
    }
}