package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.Ast
import de.thm.ii.fbs.mathParser.marshal.MathJsonMarshal
import org.antlr.v4.runtime.BailErrorStrategy
import org.antlr.v4.runtime.CommonTokenStream
import org.antlr.v4.runtime.misc.ParseCancellationException

object MathParserHelper {
    @JvmStatic
    fun parse(expr: String): Ast {
        val lexer = BailingMathLexer(expr)
        val tokens = CommonTokenStream(lexer)

        val parser = MathParser(tokens)
        parser.errorHandler = BailErrorStrategy()

        try {
            return AstBuilder(parser.expr()).build()
        } catch (e: ParseCancellationException) {
            throw MathParserException(expr, "invalid expr", e)
        }
    }

    @JvmStatic
    fun toMathJson(ast: Ast): String =
        MathJsonMarshal().marshal(ast)

    @JvmStatic
    fun fromMathJson(json: String): Ast =
        MathJsonMarshal().unmarshal(json)
}
