import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormControl,
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { SpreadsheetDialogComponent } from "src/app/dialogs/spreadsheet-dialog/spreadsheet-dialog.component";
import * as XLSX from "xlsx";

interface CellToChange {
  sheet: string;
  cell: string;
  value: number;
}

interface CellToCheck {
  cell: string;
  showWrongCells: boolean;
  errorMsg: string;
}

interface ExcelTask {
  name: string;
  workingSheet: string;
  changedCells: Array<CellToChange>;
  checkedCells: Array<CellToCheck>;
}

@Component({
  selector: "app-new-checker-page",
  templateUrl: "./new-checker-page.component.html",
  styleUrls: ["./new-checker-page.component.scss"],
})
export class NewCheckerPageComponent implements OnInit {
  fileCounter = 0;

  courseId: number;
  taskId: number;
  step: number;
  checkerForm = new UntypedFormGroup({
    checkerType: new UntypedFormControl("", [Validators.required]),
  });
  createTaskForm = new UntypedFormGroup({
    taskName: new UntypedFormControl("", [Validators.required]),
    taskSheet: new UntypedFormControl("", [Validators.required]),
    checks: new FormArray([this.newCellToArray("checks")]),
    changes: new FormArray([this.newCellToArray("changes")]),
  });
  mainFile: File;
  secondaryFile: File[] = [];
  mainFileName: string;
  secondaryFileName: string;
  sheetnames: Array<string> = [];
  workbook: XLSX.WorkBook;
  currSheetName: string;
  choosedSQLChecker;
  excelTasks: Array<ExcelTask> = [];

  constructor(private route: ActivatedRoute, private dialog: MatDialog) {}

  getCheckedCells(): Array<CellToCheck> {
    console.log(this.createTaskForm.controls.checks);
    return [];
  }

  getChangedCells(): Array<CellToChange> {
    return [];
  }

  createTask() {
    let task: ExcelTask = {
      name: this.createTaskForm.controls.taskName.value,
      workingSheet: this.createTaskForm.controls.taskSheet.value,
      checkedCells: this.getCheckedCells(),
      changedCells: this.getChangedCells(),
    };
    this.excelTasks.push(task);
    this.createTaskForm.reset();
    console.log(this.excelTasks);
  }

  getCellsArray(array: string): FormArray {
    return this.createTaskForm.get(array) as FormArray;
  }

  newCellToArray(array: string): UntypedFormGroup {
    if (array == "checks") {
      return new UntypedFormGroup({
        cell: new UntypedFormControl(""),
        isShown: new UntypedFormControl(false),
        errorMsg: new UntypedFormControl(""),
      });
    } else {
      return new UntypedFormGroup({
        sheetName: new UntypedFormControl(""),
        cell: new UntypedFormControl(""),
        value: new UntypedFormControl(""),
      });
    }
  }

  addCellToArray(array: string) {
    this.getCellsArray(array).push(this.newCellToArray(array));
  }

  removeCellFromArray(indx: number, array: string) {
    this.getCellsArray(array).removeAt(indx);
  }

  ngOnInit(): void {
    this.step = 1;
    this.route.params.subscribe((params) => {
      if (params) {
        this.courseId = params.id;
        this.taskId = params.tid;
      }
    });
  }

  openDialog(sheet: string, indx: number, array: string) {
    this.dialog
      .open(SpreadsheetDialogComponent, {
        width: "75%",
        data: { spreadsheet: this.mainFile, name: sheet },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getCellsArray(array)
            .at(indx)
            .get("cell")
            .setValue(data[0] + ":" + data[1]);
          console.log(data);
        }
      });
  }

  changeCurrSheetName(value: any) {
    this.currSheetName = value.taskName;
    console.log(this.currSheetName);
  }

  async readXlsx(file: File) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var data = e.target.result;
      this.workbook = XLSX.read(data);
      this.sheetnames = this.workbook.SheetNames;
      console.log(this.workbook);
    };
    reader.readAsArrayBuffer(file[0]);
  }

  updateMainFile(event) {
    this.mainFile = event["content"];
    this.readXlsx(this.mainFile);
  }

  updateSecondaryFile(event) {
    this.secondaryFile = event["content"];
    this.fileCounter++;
  }

  defineForm(value: any) {
    //set default value to false
    this.choosedSQLChecker = false;

    switch (value.checkerType) {
      case "sql": {
        this.mainFileName = "Aufgaben Konfiguration (.json)";
        this.secondaryFileName = "Datenbank Export (.sql)";
        break;
      }
      case "sql-checker": {
        this.mainFileName = "Aufgaben Konfiguration (.json)";
        this.secondaryFileName = "Datenbank Export (.sql)";
        this.choosedSQLChecker = true;
        break;
      }
      case "bash": {
        this.mainFileName = "Bash Script (.sh)";
        this.secondaryFileName = "Optionale Hilfsdatei (*)";
        break;
      }
      case "excel": {
        this.mainFileName = "Excel-Datei hochladen (.xlsx)";
        this.secondaryFileName = "Konfigurationsdatei hochladen (optional)";
        break;
      }
      default: {
        this.mainFileName = "Not Implemented Checker Type";
        this.secondaryFileName = "Not Implemented Checker Type";
        break;
      }
    }
  }

  increaseStep() {
    this.step++;
  }

  decreaseStep() {
    this.step--;
  }
}
