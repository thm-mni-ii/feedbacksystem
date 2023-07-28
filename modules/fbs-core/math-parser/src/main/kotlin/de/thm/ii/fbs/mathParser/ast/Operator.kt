package de.thm.ii.fbs.mathParser.ast

import java.lang.StringBuilder

data class Operator(val name: String, val precedence: Int) : Comparable<Operator> {
    companion object {
        @JvmField
        val TEXT = Operator("TEXT", -1)
        @JvmField
        val EQ = Operator("EQ", 0)
        @JvmField
        val ADD = Operator("ADD", 1)
        @JvmField
        val SUB = Operator("SUB", 1)
        @JvmField
        val MUL = Operator("MUL", 2)
        @JvmField
        val DIV = Operator("DIV", 2)
        @JvmField
        val MOD = Operator("MOD", 3)
        @JvmField
        val EXP = Operator("EXP", 3)
        @JvmField
        val RAD = Operator("RAD", 4)
        @JvmField
        val LOG = Operator("LOG", 4)
    }

    fun toDot(sb: StringBuilder, i: Int): Int {
        val j = i + 1
        sb.append("$j [label=${this.name}]\n")
        return j
    }

    override fun compareTo(other: Operator): Int =
        precedence.compareTo(other.precedence)
}
