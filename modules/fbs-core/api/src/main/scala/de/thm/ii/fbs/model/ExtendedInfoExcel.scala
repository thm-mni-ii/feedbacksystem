package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty

import scala.collection.mutable.ListBuffer

case class ExtendedInfoExcel(@JsonProperty("type") resType: String = "compareTable",
                              ignoreOrder: Boolean = false,
                              expected: ExtendedInfoExcelObject = ExtendedInfoExcelObject(),
                              result: ExtendedInfoExcelObject = ExtendedInfoExcelObject())

case class ExtendedInfoExcelObject(head: ListBuffer[String] = ListBuffer("Celle", "Wert"), rows: ListBuffer[List[String]] = ListBuffer())
