package de.thm.ii.fbs.mathParser

class MathParserException(expr: String, message: String?, cause: Exception? = null) : Exception("failed to parse $expr: $message", cause)
