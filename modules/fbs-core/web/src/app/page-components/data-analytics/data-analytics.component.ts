import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import data2 from '../../../../../../../../../Desktop/QueriesDBS_WS_21.json';

export interface GraphModel {
  data: any[];
  layout: any;
}

export interface SqlData {
  "_id": {
    "$oid": String
  },
  "id": String,
  "courseId": Number,
  "taskNumber": Number,
  "statement": String,
  "parsable": Boolean,
  "isSolution": Boolean,
  "tablesRight": Boolean,
  "selAttributesRight": Boolean,
  "proAttributesRight": Boolean,
  "stringsRight": Boolean,
  "userId": Number,
  "attempt": Number,
  "orderByRight": Boolean,
  "groupByRight": Boolean,
  "joinsRight": Boolean
}

@Component({
  selector: "app-data-analytics",
  templateUrl: "./data-analytics.component.html",
  styleUrls: ["./data-analytics.component.scss"],
})
export class DataAnalyticsComponent implements OnInit {
  jsonData = 'json-file-read-angular'
  public sqlData:SqlData[]= data2
  public graph1: GraphModel = {
    data: [
      {
        x: [1, 2, 3],
        y: [2, 6, 3],
        type: "scatter",
        mode: "lines+points",
        marker: { color: "red" },
      },
      { x: [1, 2, 3], y: [2, 5, 3], type: "bar" },
    ],
    layout: { title: "Plot 1" },
  };

  public graph2: GraphModel = {
    data: [],
    layout: { title: "Plot 2" },
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.buildCharts();
  }

  private buildCharts() {
    this.graph2.data = [
      {
        x: [1, 2, 3, 4, 5],
        y: [1, 6, 3, 6, 1],
        mode: "markers+text",
        type: "scatter",
        name: "Team A",
        text: ["A-1", "A-2", "A-3", "A-4", "A-5"],
        textposition: "top center",
        textfont: {
          family: "Raleway, sans-serif",
        },
        marker: {size: 12},
      },
      {
        x: [1.5, 2.5, 3.5, 4.5, 5.5],
        y: [4, 1, 7, 1, 4],
        mode: "markers+text",
        type: "scatter",
        name: "Team B",
        text: ["B-a", "B-b", "B-c", "B-d", "B-e"],
        textfont: {
          family: "Times New Roman",
        },
        textposition: "bottom center",
        marker: {size: 12},
      },
    ];

    this.graph2.layout = {
      xaxis: {
        range: [0.75, 5.25],
      },
      yaxis: {
        range: [0, 8],
      },
      legend: {
        y: 0.5,
        yref: "paper",
        font: {
          family: "Arial, sans-serif",
          size: 20,
          color: "grey",
        },
      },
      title: "Data Labels on the Plot",
    };
  }
}
