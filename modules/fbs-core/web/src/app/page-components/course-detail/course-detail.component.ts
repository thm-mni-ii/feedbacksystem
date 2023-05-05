import { Component, OnInit,Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { mergeMap } from "rxjs/operators";
import { of, Observable,forkJoin } from "rxjs";
import { TaskNewDialogComponent } from "../../dialogs/task-new-dialog/task-new-dialog.component";
import { CourseUpdateDialogComponent } from "../../dialogs/course-update-dialog/course-update-dialog.component";
import { AuthService } from "../../service/auth.service";
import { Roles } from "../../model/Roles";
import { TaskService } from "../../service/task.service";
import { Course } from "../../model/Course";
import { Task } from "../../model/Task";
import { CourseService } from "../../service/course.service";
import { CourseRegistrationService } from "../../service/course-registration.service";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { FeedbackAppService } from "../../service/feedback-app.service";
import { GotoLinksDialogComponent } from "../../dialogs/goto-links-dialog/goto-links-dialog.component";
import { GoToService } from "../../service/goto.service";
import { TaskPointsDialogComponent } from "../../dialogs/task-points-dialog/task-points-dialog.component";
import { ExternalClassroomService } from "../../service/external-classroom.service";
import { UserTaskResult } from "../../model/UserTaskResult";
import { ExportTasksDialogComponent } from "src/app/dialogs/export-tasks-dialog/export-tasks-dialog.component";
import { Requirement } from "src/app/model/Requirement";

import {CourseResultsService} from "../../service/course-results.service";
import {TaskPointsService} from "../../service/task-points.service";
@Component({
  selector: "app-course-detail",
  templateUrl: "./course-detail.component.html",
  styleUrls: ["./course-detail.component.scss"],
})
export class CourseDetailComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private titlebar: TitlebarService,
    public externalClassroomService: ExternalClassroomService,
    private dialog: MatDialog,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private router: Router,
    private courseService: CourseService,
    private courseRegistrationService: CourseRegistrationService,
    private feedbackAppService: FeedbackAppService,
    private courseResultService: CourseResultsService,
    private goToService: GoToService,
    private taskPointsService: TaskPointsService, 
  ) {}
 listing: any[] = [];
  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;
  evaluationUserResults: any[];
  legends=["green","red","#1E457C"];
  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.courseID = param.id;
      this.requirements = this.taskPointsService.getAllRequirements(this.courseID);
      this.requirements.forEach((element) => {
        
  
      });
     
      this.reloadCourse();
      this.reloadTasks();
      
      
      //this.evaluationUserResults=this.courseResultService.getRequirementResultData()
    /*  this.requirements.subscribe((data) => {
          data.forEach((element) => {
            console.log("element :", element.tasks);
      
          });   
      });*/
    });
    
      
    
    
    this.role = this.auth.getToken().courseRoles[this.courseID];
    if (this.goToService.getAndClearAutoJoin() && !this.role) {
      this.courseRegistrationService
        .registerCourse(this.authService.getToken().id, this.courseID)
        .subscribe(
          () =>
            this.courseService
              .getCourse(this.courseID)
              .subscribe(() => this.ngOnInit()),
          (error) => console.error(error)
        );
    }
  }

  public canEdit(): boolean {
    const globalRole = this.authService.getToken().globalRole;
    if (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole)
    ) {
      return true;
    }

    const courseRole = this.authService.getToken().courseRoles[this.courseID];
    return (
      Roles.CourseRole.isTutor(courseRole) ||
      Roles.CourseRole.isDocent(courseRole)
    );
  }

  private reloadCourse() {
    this.course = this.courseService.getCourse(this.courseID);
    this.course.subscribe((course) => {
      this.titlebar.emitTitle(course.name);
    });
    this.courseRegistrationService
      .getRegisteredCourses(this.authService.getToken().id)
      .subscribe((course) => {
        const c = course.find((_c) => _c.id === this.courseID);
        if (c && !this.role) {
          this.role = "STUDENT";
        }
      });
  }

  reloadTasks() {
    this.taskService.getAllTasks(this.courseID).subscribe((tasks) => {
      this.taskService
        .getTaskResults(this.courseID)
        .subscribe((taskResults) => {
          this.tasks = tasks;
          
         this.listing = Object.entries(taskResults).map(([key, value]) => value);
         console.log("requirements b4 :", this.requirements);
    
         this.fillprogressBar();
        /*
         this.initializeRequirements().then(() => {
           console.log("map here :", this.fillprogressBar());
         });*/
         
         
         /* this.listing=Object.entries(taskResults).map(([k, v]) => ({
            taskID: k,
            passed: v,

          }));*/
          
          this.taskResults = taskResults.reduce((acc, res) => {
            acc[res.taskID] = res;
            
           
            
            return acc;
          }, {});
        });
    });
  }

  fillprogressBar() {
    let valcounter=0;
    
    console.log("listing inside :", this.listing);
    console.log("list [0] :", this.listing[0].taskID);
    
    this.requirements.subscribe((value) => {
      console.log("req length :",value.length);
      console.log("the requ :",value);
       this.listing.forEach((element, index) => {
      console.log("entered loop");
      console.log("element.taskID 1o1 :", element);
      
      for(let j=0;j<value.length;j++){
      for(let i =0;i<value[j].tasks.length;i++){
        if ( element.taskID == value[j].tasks[i].id) {
          console.log("it works",value[j].tasks[i].id);
        }
      }
      
    }
      
    });
    });
   
  }

  updateCourse() {
    this.courseService
      .getCourse(this.courseID)
      .pipe(
        mergeMap((course) =>
          this.dialog
            .open(CourseUpdateDialogComponent, {
              width: "50%",
              data: { course: course, isUpdateDialog: true },
            })
            .afterClosed()
        )
      )
      .subscribe((res) => {
        if (res.success) {
          this.reloadCourse();
        }
      });
  }

  openExportDialog() {
    this.dialog.open(ExportTasksDialogComponent, {
      height: "auto",
      width: "40%",
      data: { courseId: this.courseID, tasks: this.tasks },
    });
  }

  createTask() {
    this.dialog
      .open(TaskNewDialogComponent, {
        height: "auto",
        width: "50%",
        data: { courseId: this.courseID },
      })
      .afterClosed()
      .subscribe(
        (result) => {
          if (result.success) {
            this.router
              .navigate(["courses", this.courseID, "task", result.task.id])
              .then();
          }
        },
        (error) => console.error(error)
      );
  }

  /**
   * Join a course by registering into it.
   */
  joinCourse() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Kurs beitreten?",
          message: "Wollen Sie diesem Kurs beitreten?",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.courseRegistrationService
            .registerCourse(this.authService.getToken().id, this.courseID)
            .subscribe(
              () =>
                this.courseService
                  .getCourse(this.courseID)
                  .subscribe(() => this.ngOnInit()),
              (error) => console.error(error)
            );
        }
      });
  }

  /**
   * Leave the course by de-registering from it.
   */
  exitCourse() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Kurs verlassen?",
          message:
            "Wollen Sie diesen Kurs verlassen? Alle ihre Abgaben könnten verloren gehen!",
        },
      })
      .afterClosed()
      .subscribe(() => {
        this.courseRegistrationService
          .deregisterCourse(this.authService.getToken().id, this.courseID)
          .subscribe(
            () => {
              this.router.navigate(["/courses"]).then();
            },
            (error) => console.error(error)
          );
      });
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole = token.courseRoles[this.courseID];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }

  joinClassroom() {
    this.externalClassroomService.join(this.courseID);
  }

  deleteCourse() {
    this.course.subscribe((course) => {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Kurs Löschen",
            message: `Kurs ${course.name} wirklich löschen? (Alle zugehörigen Aufgaben werden damit auch gelöscht!)`,
          },
        })
        .afterClosed()
        .pipe(
          mergeMap((confirmed) => {
            if (confirmed) {
              return this.courseService.deleteCourse(this.courseID);
            } else {
              return of();
            }
          })
        )
        .subscribe(
          () => {
            this.router.navigate(["courses"]).then();
          },
          (error) => console.error(error)
        );
    });
  }

  showGoLinks() {
    this.dialog.open(GotoLinksDialogComponent, {
      height: "auto",
      width: "auto",
      data: { courseID: this.courseID },
    });
  }

  goToFBA() {
    this.feedbackAppService.open(this.courseID, true).subscribe(() => {});
  }

  editPoints() {
    this.dialog
      .open(TaskPointsDialogComponent, {
        height: "85%",
        width: "80rem",
        data: {
          courseID: this.courseID,
          tasks: this.tasks,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.snackbar.open("Punktevergabe abgeschlossen");
        }
      });
  }
}
