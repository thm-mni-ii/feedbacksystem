package de.thm.ii.fbs.services.checker.math

import de.thm.ii.fbs.mathParser.{MathParserException, MathParserHelper}
import de.thm.ii.fbs.mathParser.ast.{Ast, Operator, Text, UnaryOperation}
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.{XSSFFormulaEvaluator, XSSFSheet, XSSFWorkbook}
import org.springframework.stereotype.Service

import java.io.{File, FileInputStream}
import java.text.NumberFormat
import java.util.Locale
import scala.util.matching.Regex

/**
  * A Spreadsheet Service
  */
@Service
class SpreadsheetService {
  private case class Cords(row: Int, col: Int)

  /**
    * Gets the values in the selected field range
    * @param spreadsheet the spreadsheet field
    * @param userIDField the field id of the field in which the userID should be inserted
    * @param userID      the userID to insert
    * @param fields      the field for which to get the values
    * @return the values
    */
  def getFields(spreadsheet: File, userIDField: String, userID: String, fields: String, mathJson: Boolean = false): Seq[(String, String)] = {
    val sheet = this.initSheet(spreadsheet, userIDField, userID)
    val (start, end) = this.parseCellRange(fields)
    val labels = this.getInCol(sheet, start.col, start.row, end.row)
    val values = this.getInCol(sheet, end.col, start.row, end.row)
    val parsedValues = if (mathJson) this.parseValues(values) else values

    labels.zip(parsedValues)
  }

  private def initSheet(spreadsheet: File, userIDField: String, userID: String): XSSFSheet = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    val sheet = workbook.getSheetAt(0)
    this.setCell(sheet, this.parseCellAddress(userIDField), userID)
    XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook)
    sheet
  }

  private def getInCol(sheet: XSSFSheet, col: Int, start: Int, end: Int): Seq[String] =
    (start to end).map(i => {
      val cell = Option(sheet.getRow(i)).flatMap(row => Option(row.getCell(col)))
      cell match {
        case Some(cell) => cell.getCellType match {
          case CellType.FORMULA => try {
            germanFormat.format(cell.getNumericCellValue)
          } catch {
            case e: IllegalStateException => try {
              cell.getStringCellValue
            } catch {
              case e: IllegalStateException =>
                throw new Exception(i, col, cell.getErrorCellString)
            }
          }
          case CellType.NUMERIC => germanFormat.format(cell.getNumericCellValue)
          case CellType.STRING => cell.getStringCellValue
          case _ => ""
        }
        case None => ""
      }
    })

  private def setCell(sheet: XSSFSheet, cords: Cords, value: String): Unit = {
    val row = Option(sheet.getRow(cords.row)).getOrElse(sheet.createRow(cords.row))
    val cell = Option(row.getCell(cords.col)).getOrElse(row.createCell(cords.col))
    cell.setCellValue(value)
  }

  private def parseCellRange(range: String): (Cords, Cords) = {
    val split = range.split(':')
    if (split.length != 2) {
      throw new IllegalArgumentException("expected range to have 2 components got " + split.length)
    }
    (this.parseCellAddress(split(0)), this.parseCellAddress(split(1)))
  }

  private val regexp = new Regex("(\\d+)([A-Z]+)")

  private def parseCellAddress(address: String): Cords = {
    val m = regexp.findFirstMatchIn(address) match {
      case Some(m) => m
      case _ => throw new IllegalArgumentException(address + " is not a valid cell address")
    }
    Cords(Integer.parseInt(m.group(1))-1, this.colToInt(m.group(2).charAt(0))-1)
  }

  private def colToInt(col: Char): Int =
    col.toInt - 64

  private def parseValues(value: Seq[String]): Seq[String] =
    value.map(v =>
      try {
        MathParserHelper.toLatex(MathParserHelper.parse(v))
      } catch {
        // Explicitly mark the value as a string to prevent parsing exceptions on the client
        case _: MathParserException => MathParserHelper.toLatex(new Ast(new UnaryOperation(Operator.TEXT, new Text(v))))
      }
    )

  private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
  germanFormat.setGroupingUsed(false)
  germanFormat.setMaximumFractionDigits(germanFormat.getMaximumIntegerDigits)

  /**
    * @param row the row where the errror occured
    * @param col the col where the error occured
    * @param message the error returned by the spreadsheet
    */
  class Exception(row: Int, col: Int, message: String) extends RuntimeException("SpreadsheetException@" + row.toString + "," + col.toString + ": " + message)
}
