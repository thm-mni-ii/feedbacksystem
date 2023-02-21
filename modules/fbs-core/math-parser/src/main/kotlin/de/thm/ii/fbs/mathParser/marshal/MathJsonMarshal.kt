package de.thm.ii.fbs.mathParser.marshal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.*
import de.thm.ii.fbs.mathParser.ast.*
import java.io.Serializable
import java.lang.ArithmeticException

class MathJsonMarshal : Marshal {
    private val objectMapper = ObjectMapper()
    private val marshalOperatorMap = mapOf(
        Operator.ADD to "Add",
        Operator.SUB to "Subtract",
        Operator.MUL to "Multiply",
        Operator.DIV to "Divide",
        Operator.EXP to "Power",
        Operator.RAD to "Root",
    )
    private val unmarshalOperatorMap = mapOf(
        "Add" to Operator.ADD,
        "Subtract" to Operator.SUB,
        "Multiply" to Operator.MUL,
        "Divide" to Operator.DIV,
        "Rational" to Operator.DIV,
        "Power" to Operator.EXP,
    )

    override fun marshal(input: Ast): String =
        objectMapper.writeValueAsString(marshalExpr(input.root))

    private fun marshalExpr(input: Expr): Serializable =
        when (input) {
            is Operation -> marshalOperation(input)
            is UnaryOperation -> marshalUnaryOperation(input)
            is Var -> marshalVar(input)
            is Num -> marshalNum(input)
            else -> throw IllegalArgumentException("${input::class.qualifiedName} is not a marshalable expression")
        }

    private fun marshalNum(input: Num): Serializable =
        try {
            input.content.intValueExact()
        } catch (_: ArithmeticException) {
            input.content.toString()
        }

    private fun marshalVar(input: Var): String =
        input.content

    private fun marshalUnaryOperation(input: UnaryOperation): ArrayNode =
        when (input.operator) {
            Operator.SUB -> objectMapper.createArrayNode().add("Negate").add(marshalExpr(input.target))
            else -> throw IllegalArgumentException("$input Operator is not marshalable")
        }

    private fun marshalOperation(input: Operation): ArrayNode =
        objectMapper.createArrayNode()
            .add(marshalOperator(input.operator))
            .add(marshalExpr(input.left))
            .add(marshalExpr(input.right))

    private fun marshalOperator(operator: Operator): String =
        marshalOperatorMap[operator] ?: throw IllegalArgumentException("$operator is not a marshalable operator")

    override fun unmarshal(input: String): Ast = Ast(
        unmarshalNode(objectMapper.readTree(input))
    )

    private fun unmarshalNode(obj: JsonNode): Expr =
        when (obj) {
            is ArrayNode -> unmarshalArray(obj)
            is ObjectNode -> unmarshalObject(obj)
            is TextNode -> unmarshalString(obj.asText())
            is IntNode -> unmarshalNumber(obj.asInt())
            is DoubleNode -> unmarshalNumber(obj.asDouble())
            else -> throw IllegalArgumentException("${obj::class.qualifiedName} is not unmarshalable")
        }

    private fun unmarshalNumber(obj: Number): Expr =
        Num(obj)

    private fun unmarshalString(obj: String): Expr =
        try {
            Num(obj)
        } catch (_: NumberFormatException) {
            Var(obj)
        }

    private fun unmarshalObject(obj: ObjectNode): Expr {
        val key = obj.fieldNames().next()
        val value = obj[key]
        return when (key) {
            "num" -> Num(value.asText())
            "sym" -> Var(value.asText())
            "fn" -> unmarshalArray(value as ArrayNode)
            else -> throw IllegalArgumentException("unknown field $key")
        }
    }

    private fun unmarshalArray(obj: ArrayNode): Expr {
        val operatorName = if (obj[0] is ObjectNode) {
            obj[0].get("sym").asText()
        } else {
            obj[0].asText()
        }
        return when (operatorName) {
            "Square" -> Operation(Operator.EXP, unmarshalNode(obj[1]), Num(2))
            "Sqrt" -> Operation(Operator.RAD, unmarshalNode(obj[1]), Num(2))
            else -> recursiveUnmarshal(unmarshalOperator(operatorName), obj, 1)
        }
    }

    private fun recursiveUnmarshal(operator: Operator, obj: ArrayNode, i: Int): Expr =
        Operation(
            operator,
            unmarshalNode(obj.get(i)),
            if (i + 2 < obj.size())
                recursiveUnmarshal(operator, obj, i+1)
            else
                unmarshalNode(obj.get(i+1))
        )

    private fun unmarshalOperator(operator: String): Operator =
        unmarshalOperatorMap[operator] ?: throw IllegalArgumentException("$operator is not a marshalable operator")
}

private fun ArrayNode.add(marshalExpr: Serializable): ArrayNode = when (marshalExpr) {
    is JsonNode -> this.add(marshalExpr)
    is String -> this.add(marshalExpr)
    is Int -> this.add(marshalExpr)
    else -> throw IllegalArgumentException("${marshalExpr::class.qualifiedName} is not a addable serializable")
}
