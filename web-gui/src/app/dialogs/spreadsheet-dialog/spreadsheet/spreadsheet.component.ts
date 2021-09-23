import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import canvasDatagrid from 'canvas-datagrid/dist/canvas-datagrid.debug.js';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-spreadsheet',
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent implements OnInit {
  private grid;

  @Input()
  set data(data) {
    this.grid.data = data;
  }

  @Input()
  set spreadsheet(spreadsheet: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, {type: 'array'});
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      this.data = XLSX.utils.sheet_to_json(sheet, {header: 'A', defval: '', blankrows: true});
    };
    reader.readAsArrayBuffer(spreadsheet);
  }

  @Output()
  private select = new EventEmitter<string[]>();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.grid = canvasDatagrid({editable: false});
    this.grid.addEventListener('selectionchanged', (e) => {
      const {bottom, left, right, top} = e.selectionBounds;
      const first = top + 1 + this.toColName(left);
      const second = bottom + 1 + this.toColName(right);
      this.select.emit([first, second]);
    });
    this.elementRef.nativeElement.appendChild(this.grid);
  }

  private toColName(id: number) {
    return Object.keys(this.grid.data[0])[id];
  }
}
