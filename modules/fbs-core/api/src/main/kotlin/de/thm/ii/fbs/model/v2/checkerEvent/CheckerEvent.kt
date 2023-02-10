package de.thm.ii.fbs.model.v2.checkerEvent

abstract class CheckerEvent<T>(open var action: T) {
    protected abstract var eventType: String
}

typealias CheckerEventGen = CheckerEvent<*>