package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty

import scala.collection.mutable.ListBuffer

object ExtendedInfoExcel {
  def newV1: ExtendedInfoExcel = ExtendedInfoExcel(
    expected = ExtendedInfoExcelObject(head = ListBuffer("Celle", "Wert")),
    result = ExtendedInfoExcelObject(head = ListBuffer("Celle", "Wert"))
  )

  def newV2: ExtendedInfoExcel = ExtendedInfoExcel(
    expected = ExtendedInfoExcelObject(head = ListBuffer("Celle", "Wert", "Formel")),
    result = ExtendedInfoExcelObject(head = ListBuffer("Celle", "Wert", "Formel", "Folgefehler"))
  )
}

case class ExtendedInfoExcel(@JsonProperty("type") resType: String = "compareTable",
                             ignoreOrder: Boolean = false,
                             expected: ExtendedInfoExcelObject,
                             result: ExtendedInfoExcelObject)

case class ExtendedInfoExcelObject(head: ListBuffer[String], rows: ListBuffer[List[String]] = ListBuffer())
