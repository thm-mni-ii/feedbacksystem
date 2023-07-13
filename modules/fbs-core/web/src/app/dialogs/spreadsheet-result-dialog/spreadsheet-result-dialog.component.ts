import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  Inject,
} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
// @ts-ignore
import canvasDatagrid from "canvas-datagrid";

@Component({
  selector: "app-spreadsheet-result-dialog",
  templateUrl: "./spreadsheet-result-dialog.component.html",
  styleUrls: ["./spreadsheet-result-dialog.component.scss"],
})
export class SpreadsheetResultDialogComponent implements AfterViewInit {
  @ViewChild("gridContainer") gridContainer!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

  ngAfterViewInit() {
    const gridElement = this.gridContainer.nativeElement;
    const grid = canvasDatagrid({
      parentNode: gridElement,
      data: this.data,
      editable: false, // Set editable option to false
    });
  }
}
