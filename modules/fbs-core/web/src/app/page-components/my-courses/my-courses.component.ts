import { Component, OnInit, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import { TitlebarService } from "../../service/titlebar.service";
import { Course } from "../../model/Course";
import { AuthService } from "../../service/auth.service";
import { mergeMap, startWith } from "rxjs/operators";
import { UntypedFormControl } from "@angular/forms";
import { CourseRegistrationService } from "../../service/course-registration.service";
import { TaskService } from "src/app/service/task.service";
import { SubmissionService } from "src/app/service/submission.service";

/**
 * Show all registered courses
 */
@Component({
  selector: "app-my-courses",
  templateUrl: "./my-courses.component.html",
  styleUrls: ["./my-courses.component.scss"],
})
export class MyCoursesComponent implements OnInit {
  @Input() data: Course;
  constructor(
    private titlebar: TitlebarService,
    private courseRegistrationService: CourseRegistrationService,
    private taskService: TaskService,
    private submissionService: SubmissionService,
    private authService: AuthService,

  ) { }


  userID: number;
  totalTasks: any = 0;
  courses: Observable<Course[]> = of();
  filteredCourses: Observable<Course[]> = of();
  control: UntypedFormControl = new UntypedFormControl();
  myTasks: any[] = [];
  passed: number = 0;
  failed:number = 0; 
  offen:number ;
  legends=["green","red","#1E457C"];
 




  ngOnInit() {
    
    this.titlebar.emitTitle("Meine Kurse");
    this.userID = this.authService.getToken().id;
    this.courses = this.courseRegistrationService.getRegisteredCourses(this.userID);
    
    this.getTaskProgress();
    this.filteredCourses = this.control.valueChanges.pipe(
      startWith(""),
      mergeMap((value) => this._filter(value))
    );


  }

  private _filter(value: string): Observable<Course[]> {
    const filterValue = this._normalizeValue(value);
    return this.courses.pipe(
      mergeMap((courseList) => {
        if (filterValue.length > 0) {
          return of(
            courseList.filter((course) =>
              this._normalizeValue(course.name).includes(filterValue)
            )
          );
        } else {
          return this.courses;
        }
      })
    );
  }



  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }

  countResults(allSubmissions: any[], failed: boolean) {
    
    let aufchecker:boolean=false;
    if (allSubmissions.length != 0) {
      for (var submission of allSubmissions) {
        if (!failed) {
          this.passed++;
          aufchecker=true;
          
          break;
        }
        for (var checker of submission.results) {
          if (checker.exitCode == 0) {
            
            failed = false;
            this.passed++;
            aufchecker=true;
            break;
          }
        }
      }
      if (failed) {
        
        this.failed++;
        aufchecker=true;
        
      }
    }
    if(aufchecker==false){
      this.offen++;
    }
  }


  getTaskProgress() {
    
    this.courses.subscribe((courses) => {
      this.offen=0;
      courses.forEach((course) => {
        this.getProgress(course.id);
        

        
        this.taskService.getAllTasks(course.id).subscribe((tasks) => {
          tasks.forEach((task) => {
            this.myTasks.push(task);
          });
          this.totalTasks = this.myTasks.length;
          
        
        
        });
          
      });
          
    
      
    

      
    });
  }

  getProgress(courseId: number) {
    this.taskService.getAllTasks(courseId).subscribe(
      (allTasks) => {
        
        if (allTasks.length > 0) {
          
          for (var task of allTasks) {
            let failed = true;
            this.submissionService
              .getAllSubmissions(this.userID, courseId, task.id)
              .subscribe((allSubmissions) => {
                this.countResults(allSubmissions, failed);
                
              });
          }
        }
      },
      () => { }
    );
    }



}
