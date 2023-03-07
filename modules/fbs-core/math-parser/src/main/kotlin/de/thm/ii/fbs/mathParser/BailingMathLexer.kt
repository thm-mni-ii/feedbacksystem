package de.thm.ii.fbs.mathParser

import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.LexerNoViableAltException
import org.antlr.v4.runtime.RecognitionException

class BailingMathLexer(val expr: String) : MathLexer(CharStreams.fromString(expr)) {
    override fun recover(e: LexerNoViableAltException?) {
        throw MathParserException(expr, e?.message)
    }
    override fun recover(re: RecognitionException?) {
        throw MathParserException(expr, re?.message)
    }
}
