package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.Ast
import org.antlr.v4.runtime.CharStreams
import org.antlr.v4.runtime.CommonTokenStream

object MathParserHelper {
    @JvmStatic
    fun parse(input: String): Ast {
        val lexer = MathLexer(CharStreams.fromString(input))
        val tokens = CommonTokenStream(lexer)
        val parser = MathParser(tokens)
        return AstBuilder(parser.expr()).build()
    }
}
