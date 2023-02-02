package de.thm.ii.fbs.handler

import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.Handler
import de.thm.ii.fbs.utils.v2.handler.When
import org.springframework.stereotype.Service

@Handle(When.BEFORE)
@Service
class TestBeforeHandler : Handler<String, Boolean> {
    override fun handle(input: String): Boolean {
        println(input)
        return true
    }
}

@Handle(When.AFTER)
class TestAfterHandler : Handler<String, Boolean> {
    override fun handle(input: String): Boolean {
        println(input)
        return true
    }
}

@Handle(When.ONVISIT)
//@Handle(When.ONERROR)
class TestOnHandler : Handler<String, Boolean> {
    override fun handle(input: String): Boolean {
        println(input)
        return true
    }
}

class TestNoHandler : Handler<String, Boolean> {
    override fun handle(input: String): Boolean {
        println(input)
        return false
    }
}