package de.thm.ii.fbs.utils.v2.handler

interface Handler<In, Out> {
    fun handle(input: In): Out
}
