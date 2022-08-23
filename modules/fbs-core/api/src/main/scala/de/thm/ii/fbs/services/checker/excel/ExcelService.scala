package de.thm.ii.fbs.services.checker.excel

import de.thm.ii.fbs.model.{ExcelMediaInformation, ExcelMediaInformationChange}
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.{XSSFCell, XSSFFormulaEvaluator, XSSFSheet, XSSFWorkbook}
import org.springframework.stereotype.Service

import java.io.{File, FileInputStream}
import java.text.NumberFormat
import java.util.Locale
import scala.util.matching.Regex

/**
  * A Spreadsheet Service
  */
@Service
class ExcelService {
  private case class Cords(row: Int, col: Int)

  /**
    * Gets the values in the selected field range
    * @param spreadsheet the spreadsheet field
    * @param excelMediaInformation the spreadsheet Configurations
    * @return the values
    */
  def getFields(spreadsheet: File, excelMediaInformation: ExcelMediaInformation): Seq[(String, XSSFCell)] = {
    val sheet = this.initSheet(spreadsheet, excelMediaInformation)
    val (start, end) = this.parseCellRange(excelMediaInformation.outputFields)
    val values = this.getInCol(sheet, end.col, start.row, end.row)
    values
  }

  private def initSheet(spreadsheet: File, excelMediaInformation: ExcelMediaInformation): XSSFSheet = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    val sheet = workbook.getSheetAt(excelMediaInformation.sheetIdx)
    this.setCells(workbook, excelMediaInformation.changeFields)
    XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook)
    sheet
  }

  private def getInCol(sheet: XSSFSheet, col: Int, start: Int, end: Int): Seq[(String, XSSFCell)] =
    (start to end).map(i => {
      val row = sheet.getRow(i)
      val cell = if (row != null) {
        row.getCell(col)
      } else { null }

      val res = if (cell == null) {
        ""
      } else {
        cell.getCellType match {
          case CellType.FORMULA => try {
            germanFormat.format(cell.getNumericCellValue)
          } catch {
            case _: IllegalStateException => try {
              cell.getStringCellValue
            } catch {
              case _: IllegalStateException =>
                throw new Exception(i, col, cell.getErrorCellString)
            }
          }
          case CellType.NUMERIC => germanFormat.format(cell.getNumericCellValue)
          case CellType.STRING => cell.getStringCellValue
          case _ => ""
        }
      }
      (res, cell)
    })

  private def setCells(workbook: XSSFWorkbook, changeFields: List[ExcelMediaInformationChange]): Unit = {
    changeFields.foreach(f => {
      val sheet = workbook.getSheetAt(f.sheetIdx)
      this.getCell(sheet, f.cell).setCellValue(f.newValue)
    })
  }

  private def parseCellRange(range: String): (Cords, Cords) = {
    val split = range.split(':')
    if (split.length != 2) {
      throw new IllegalArgumentException("expected range to have 2 components got " + split.length)
    }
    (this.parseCellAddress(split(0)), this.parseCellAddress(split(1)))
  }

  private val regexp = new Regex("([A-Z]+)(\\d+)")

  private def parseCellAddress(address: String): Cords = {
    val m = regexp.findFirstMatchIn(address) match {
      case Some(m) => m
      case _ => throw new IllegalArgumentException(address + " is not a valid cell address")
    }
    Cords(Integer.parseInt(m.group(2))-1, this.colToInt(m.group(1).charAt(0))-1)
  }

  private def colToInt(col: Char): Int =
    col.toInt - 64

  private def getCell(sheet: XSSFSheet, cell: String) = {
    val cords = this.parseCellAddress(cell)
    val col = sheet.getRow(cords.row).getCell(cords.col)
    if (col == null) throw new Exception(cords.row, cords.col, s"Cell '$cell' Not Found")

    col
  }

  private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)

  /**
    * @param row the row where the errror occured
    * @param col the col where the error occured
    * @param message the error returned by the spreadsheet
    */
  class Exception(row: Int, col: Int, message: String) extends RuntimeException("SpreadsheetException@" + row.toString + "," + col.toString + ": " + message)
}
