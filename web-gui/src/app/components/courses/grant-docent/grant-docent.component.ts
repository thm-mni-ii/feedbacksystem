import {Component, OnInit} from '@angular/core';
import {GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';
import {DatabaseService} from '../../../service/database.service';
import {Observable} from 'rxjs';
import {Pipe, PipeTransform} from '@angular/core';

/**
 * Adding and removing docents from courses
 */
@Component({
  selector: 'app-grant-docent',
  templateUrl: './grant-docent.component.html',
  styleUrls: ['./grant-docent.component.scss']
})
export class GrantDocentComponent implements OnInit {
  courses: Observable<GeneralCourseInformation[]>;
  filterValue = '';

  constructor(private db: DatabaseService) {
  }

  public loadAllCourses() {
    this.courses = this.db.getAllCourses();
  }

  public setFilterValue(filterV: string) {
    this.filterValue = filterV;
  }

  public ngOnInit() {
    this.loadAllCourses();
  }
}

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fieldName: string): any[] {
    if (!items) { return []; }
    if (!searchText || searchText.length === 0) { return items; }
    searchText = searchText.toLowerCase();

    return items.filter(item => {
      if (item && item[fieldName]) {
        return item[fieldName].toLowerCase().includes(searchText);
      }
      return false;
    });
  }
}
