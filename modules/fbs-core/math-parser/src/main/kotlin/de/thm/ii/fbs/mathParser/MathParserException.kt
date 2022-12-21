package de.thm.ii.fbs.mathParser

class MathParserException(expr: String, message: String?) : Exception("failed to parse $expr: $message")
