package de.thm.ii.fbs.services.checker

import java.io.{File, FileInputStream}

import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.xssf.usermodel.{XSSFSheet, XSSFWorkbook, XSSFFormulaEvaluator}
import org.springframework.stereotype.Service

import scala.util.matching.Regex

/**
  * A Spreadsheet Service
  */
@Service
class SpreadsheetService {
  private case class Cords(row: Int, col: Int)

  def initSheet(spreadsheet: File, userIDField: String, userID: String): XSSFSheet = {
    val input = new FileInputStream(spreadsheet)
    val workbook = new XSSFWorkbook(input)
    val sheet = workbook.getSheetAt(0)
    this.setCell(sheet, this.parseCellAddress(userIDField), userID)
    XSSFFormulaEvaluator.evaluateAllFormulaCells(workbook)
    sheet
  }

  def getFields(spreadsheet: File, userIDField: String, userID: String, fields: String): Seq[(String, String)] = {
    val sheet = this.initSheet(spreadsheet, userIDField, userID)
    val (start, end) = this.parseCellRange(fields)
    val labels = this.getInCol(sheet, start.col, start.row, end.row)
    val values = this.getInCol(sheet, end.col, start.row, end.row)
    labels.zip(values)
  }

  private def getInCol(sheet: XSSFSheet, col: Int, start: Int, end: Int): Seq[String] =
    (start to end).map(i => {
      println("row:" + i + " col:" + col)
      val cell = sheet.getRow(i).getCell(col)
      val res = if (cell == null) {
        ""
      } else {
        cell.getCellType match {
          case CellType.FORMULA => try {
            cell.getNumericCellValue.toString
          } catch {
            case e: IllegalStateException => cell.getStringCellValue
          }
          case CellType.NUMERIC => cell.getNumericCellValue.toString
          case CellType.STRING => cell.getStringCellValue
          case _ => ""
        }
      }
      println(res)
      res
    })

  private def setCell(sheet: XSSFSheet, cords: Cords, value: String): Unit = {
    sheet.getRow(cords.row).getCell(cords.col).setCellValue(value)
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
}
