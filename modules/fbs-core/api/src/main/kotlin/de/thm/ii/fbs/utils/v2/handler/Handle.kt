package de.thm.ii.fbs.utils.v2.handler

@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@Repeatable
@MustBeDocumented
annotation class Handle(val execution: When)
