package de.thm.ii.fbs.services.checker.math

import org.antlr.v4.runtime.{CharStreams, CommonTokenStream}
import org.springframework.stereotype.Component
import de.thm.ii.fbs.mathParser.{MathLexer, MathParser}

@Component
class MathParserService {
  def parse(input: String): Unit = {
    val lexer = new MathLexer(CharStreams.fromString(input))
    val tokens = new CommonTokenStream(lexer)
    val parser = new MathParser(tokens)
    println(parser.expr())
  }
}
