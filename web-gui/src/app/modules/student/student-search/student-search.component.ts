import {Component, OnInit} from '@angular/core';

/**
 * Component for searching for courses.
 */
@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.scss']
})
export class StudentSearchComponent implements OnInit {

  courses: Course[] = [
    {name: 'Datenbanksysteme', id: 'CS1010'},
    {name: 'Programmieren interaktiver Systeme', id: 'CS1015'},
    {name: 'Compilerbau', id: 'CS1020'},
    {name: 'Objektorientierte Programmierung', id: 'CS1011'},
    {name: 'Kurs X', id: 'CS1010'},

  ];

  constructor() {
  }

  ngOnInit() {
  }

}

export interface Course {
  name: String;
  id: String;
}
