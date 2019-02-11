import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../../../service/database.service';
import {Observable} from 'rxjs';
import {DashboardProf, GeneralCourseInformation} from '../../../interfaces/HttpInterfaces';
import {TitlebarService} from '../../../service/titlebar.service';
import {MatTabChangeEvent} from '@angular/material';
import {map} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-prof-dashboard',
  templateUrl: './prof-dashboard.component.html',
  styleUrls: ['./prof-dashboard.component.scss']
})
export class ProfDashboardComponent implements OnInit {

  constructor(private db: DatabaseService, private tb: TitlebarService) {
  }

  courses: GeneralCourseInformation[];
  matrix$: Observable<DashboardProf[]>;
  keys = Object.keys;
  filter = new FormControl();
  testData: DashboardProf[] = [
    {
      passed: 0,
      username: 'alibaba',
      prename: 'ali',
      surname: 'baba',
      tasks: [{
        A1: {
          trials: 2,
          passed: true,
        },
        A2: {
          trials: 12,
          passed: true,
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'General',
      surname: 'Kenobi',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        },
        A6: {
          trials: 0,
          passed: false
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Meister',
      surname: 'Propper',
      tasks: [{
        A1: {
          trials: 3,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        },
        A4: {
          trials: 7,
          passed: true,
        },
        A7: {
          trials: 22,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Aladin',
      surname: 'unddieLampe',
      tasks: [{
        A1: {
          trials: 6,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        },
        A4: {
          trials: 2,
          passed: true,
        },
        A5: {
          trials: 5,
          passed: true
        },
        A6: {
          trials: 2,
          passed: true,
        },
        A7: {
          trials: 2540,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Kevin',
      surname: 'Mugabe',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Albert',
      surname: 'Einstein',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Thomas',
      surname: 'Lokomutive',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Mahad',
      surname: 'Magandi',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Luke',
      surname: 'Skywalker',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Annikin',
      surname: 'Skywalker',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Musta',
      surname: 'Fahrid',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Musta',
      surname: 'Fahrid',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Musta',
      surname: 'Fahrid',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Musta',
      surname: 'Fahrid',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        }
      }],
      user_id: 1
    },
    {
      passed: 1,
      username: 'Mustafa',
      prename: 'Musta',
      surname: 'Fahrid',
      tasks: [{
        A1: {
          trials: 200,
          passed: false,
        },
        A2: {
          trials: 2,
          passed: true,
        },
        A3: {
          trials: 20,
          passed: true
        },
        A4: {
          trials: 200,
          passed: false,
        },
        A5: {
          trials: 2,
          passed: true,
        },
        A6: {
          trials: 20,
          passed: true
        },
        A7: {
          trials: 200,
          passed: false,
        },
        A8: {
          trials: 2,
          passed: true,
        },
        A9: {
          trials: 20,
          passed: true
        },
        A10: {
          trials: 200,
          passed: false,
        },
        A11: {
          trials: 2,
          passed: true,
        },
        A12: {
          trials: 20,
          passed: true
        },
        A13: {
          trials: 200,
          passed: false,
        },
        A14: {
          trials: 2,
          passed: true,
        },
        A15: {
          trials: 20,
          passed: true
        },
      }],
      user_id: 1
    },
  ];

  ngOnInit(): void {
    this.filter.valueChanges.subscribe(value => {
      console.log(value);
    });

    this.tb.emitTitle('Dashboard');
    this.db.getSubscribedCourses().subscribe(courses => {
      this.courses = courses;
    });
  }


  /**
   * Load matrix for the right course. Every tab represents a course
   * @param event The event when tab changes
   */
  tabChanged(event: MatTabChangeEvent) {
    const course = this.courses.find(value => {
      return value.course_name === event.tab.textLabel;
    });

    this.matrix$ = this.db.getAllUserSubmissions(course.course_id);
  }


}
