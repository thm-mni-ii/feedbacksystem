import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material';

/**
 *  Service to communicate with db.
 *  Get submission result or submit for a given Task.
 *  Subscribe and unsubscribe a course. Check results
 *  for courses and more.
 */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {


  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
  }


  // GET REQUESTS


  /**
   * Returns all courses an user subscribed to
   * @authorized all
   */
  getUserCourses(): Observable<CourseTableItem[]> {
    return this.http.get<CourseTableItem[]>('/api/v1/courses');
  }

  /**
   * Returns all courses
   * @authorized all
   */
  getAllCourses(): Observable<CourseTableItem[]> {
    return this.http.get<CourseTableItem[]>('/api/v1/courses/all');
  }

  /**
   * Return all task for course
   * with given id
   * @param id of course to obtain task from
   * @authorized all
   */
  getCourseDetail(id: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>('/api/v1/courses/' + id);
  }


  /**
   * Get all results of all users of all tasks
   * @param id of course to obtain all submissions
   * @authorized docent
   */
  getAllUserSubmissions(id: number): Observable<ProfDashboard[]> {
    return this.http.get<ProfDashboard[]>('/api/v1/courses/' + id + '/submissions');
  }

  /**
   * Return details of task
   * @param idCourse of course where the task is
   * @param idTask of task from which details will be obtained
   */
  getTaskDetail(idCourse: number, idTask: number) {
    return this.http.get('/api/v1/courses/' + idCourse + '/tasks/' + idTask);
  }

  /**
   * For a given task_id :id the saved results
   * @param idTask id of task
   */
  getTaskResult(idTask: number) {
    return this.http.get('/api/v1/tasks/' + idTask + '/result');
  }

  /**
   * Returns all submissions an user
   * did for a given task
   * @param idCourse of course
   * @param idTask of task where all submissions will be returned
   */
  getTaskSubmissions(idCourse: number, idTask: number) {
    return this.http.get('/api/v1/courses/' + idCourse + '/tasks/' + idTask + '/submissions');
  }

  getOverview(): Observable<DashboardInformation[]> {
    return this.http.get<DashboardInformation[]>('/api/v1/courses/submissions');
  }

  /**
   * get all registered users.
   * @authorized admin
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/v1/users');
  }

  /**
   * Get a list of all users' last logins.
   * Sort can be asc or desc.
   * @authorized admin
   */
  getLastLogins(): Observable<User[]> {
    return this.http.get<User[]>('/api/v1/users/last_logins');
  }


  // POST REQUESTS


  /**
   * Create a new Course
   * @param name
   * @param description
   * @param standard_task_typ
   * @param course_semester
   * @param course_modul_id
   * @param userDataAllowed
   */
  createCourse(name: string, description: string, standard_task_typ: string, course_semester: string,
               course_modul_id: string, userDataAllowed: boolean) {
    return this.http.post('/api/v1/courses', {
      name: name,
      description: description,
      standard_task_typ: standard_task_typ,
      course_semester: course_semester,
      course_modul_id: course_modul_id,
      anonymous: userDataAllowed
    });
  }

  /**
   * User subscription to course with :id
   * @param courseID of course to subscribe
   */
  subscribeCourse(courseID: number): Observable<Success> {
    return this.http.post<Success>('/api/v1/courses/' + courseID + '/subscribe', {});
  }

  /**
   * User unsub course with :id
   * @param id of course to unsub
   */
  unsubscribeCourse(id: number) {
    return this.http.post('/api/v1/courses/' + id + '/unsubscribe', {});
  }

  /**
   * Grant a user edit rights in course
   * @param id of course
   * @param username of user that should become edit rights
   */
  grantUserEdit(id: number, username: string) {
    return this.http.post('/api/v1/courses/' + id + '/grant', {username: username, grant_type: 'edit'});
  }

  /**
   * User submits task as file or string
   * @param idTask of task that will be submitted
   * @param data that the user submits
   */
  submitTask(idTask: number, data: File | string) {
    if (data instanceof File) { // Data is file
      let upload_url: string;
      // File in form data
      const formDataFile = new FormData();
      formDataFile.append('file', data, data.name);

      // Ask for upload route and save it in upload_url
      this.http.post<SubmitResult>('/api/v1/tasks/' + idTask + '/submit', {}).subscribe(res => {
        upload_url = res.upload_url;
      }, err => {
        console.log(err);
      }, () => {

        // Send form file to upload route
        this.http.post(upload_url, formDataFile, {
          headers: {'Authorization': 'Bearer ' + localStorage.getItem('user')}
        }).subscribe();
      });
    } else { // Data is string
      this.http.post<SubmitResult>('/api/v1/tasks/' + idTask + '/submit', {data: data}).subscribe(res => {
        return res.success;
      });
    }
  }

  /**
   * Lecturer creates a new Task
   * @param idCourse The id of course where task will be added
   * @param name This is the name of the Task
   * @param description This is the description of the task
   * @param file This will be the solution file from Lecturer
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   */
  createTask(idCourse: number, name: string, description: string, file: File, test_type: string) {
    // Solution file
    const formData = new FormData();
    formData.append('file', file, file.name);


    this.http.post<NewTaskFileUpload>('/api/v1/courses/' + idCourse + '/tasks', {
      name: name,
      description: description,
      test_type: test_type
    }).subscribe(result => {

      // Result comes back with upload url for solution file
      this.http.post(result.upload_url, formData, {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('user')}
      }).subscribe((value: { upload_success: boolean, filename: string }) => {
        if (value.upload_success) {
          this.snackBar.open('Aufgabe ' + name + ' erstellt', 'OK', {duration: 3000});
        } else {
          this.snackBar.open('Fehler beim upload der Lösungs Datei', 'OK', {duration: 5000});
        }
      });
    });
  }

  /**
   * Docent adds tutor to one of his courses
   * @param courseID The course where user will be add
   * @param userID The id of user to add
   */
  addTutorToCourse(courseID: number, userID: number): Observable<Success> {
    return this.http.post<Success>('/api/v1/courses/' + courseID + '/grant/tutor', {userid: userID});
  }

  /**
   * Docent removes tutor from his course
   * @param courseID The course where user will be removed
   * @param userID The id of user to remove
   */
  removeTutorFromCourse(courseID: number, userID: number): Observable<Success> {
    return this.http.post<Success>('/api/v1/courses/' + courseID + '/deny/tutor', {userid: userID});
  }

  /**
   * User get docent rights to course
   * @param courseID
   * @param userID
   */
  addDocentToCourse(courseID: number, userID: number): Observable<Success> {
    return this.http.post<Success>('/api/v1/courses/' + courseID + '/grant/docent', {userid: userID});
  }

  /**
   * User loses docent rights to course
   * @param courseID
   * @param userID
   */
  removeDocentFromCourse(courseID: number, userID: number): Observable<Success> {
    return this.http.post<Success>('/api/v1/courses/' + courseID + '/deny/docent', {userid: userID});
  }

  /**
   * Admin chooses user role
   * @param userID The id of user
   * @param userRole The next role user will have
   */
  changeUserRole(userID: number, userRole: number): Observable<RoleChanged> {
    return this.http.post<RoleChanged>('/api/v1/users/grant/' + userID, {role: userRole});
  }

  /**
   * Only Admin can create a testsystem. id means a unique testsystem short name.
   * @param id
   * @param name
   * @param description
   * @param supported_formats
   * @param machine_port
   * @param machine_ip
   */
  adminCreateTestsysteme(id: number, name: string, description: string, supported_formats: string,
                         machine_port: number, machine_ip: number) {
    return this.http.post('/api/v1/testsystems', {
      id: id, name: name, description: description,
      supported_formats: supported_formats, machine_port: machine_port, machine_ip: machine_ip
    }).subscribe(msg => {
      console.log('CREATE TESTSYSTEME: ' + JSON.stringify(msg));
    });
  }


  // PUT REQUESTS


  /**
   * Update an existing course
   * @param id The id of course that will be updated
   * @param name New name the updated course should have
   * @param description New Description the updated course should have
   * @param standard_task_typ Select standard task type for this course
   * @param course_semester Select the semester of this course
   * @param course_module_id Unique id the course has. Example (CS1010)
   * @param isPublic Should the course be displayed to students or not
   */
  updateCourse(id: number, name: string, description: string, standard_task_typ: string, course_semester: string,
               course_module_id: string, isPublic: boolean): Observable<Success> {
    return this.http.put<Success>('/api/v1/courses/' + id, {
      name: name,
      description: description,
      standard_task_typ: standard_task_typ,
      course_semester: course_semester,
      course_modul_id: course_module_id,
      anonymous: isPublic
    });
  }

  /**
   * Lecturer updates an given Task
   * @param idTask The unique id of task to update
   * @param name This is the new name of the updated task
   * @param description This is the description of updated task
   * @param file This is the solution file of updated Task
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   */
  updateTask(idTask: number, name: string, description: string, file: File, test_type: string) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.put('/api/v1/tasks/' + idTask, {
      name: name,
      description: description,
      test_type: test_type
    }).subscribe((result: { success: boolean, upload_url }) => {
      if (result.success) {

        // File upload
        this.http.post(result.upload_url, formData, {
          headers: {'Authorization': 'Bearer ' + localStorage.getItem('user')}
        }).subscribe((value: { upload_success: boolean, filename: string }) => {
          if (value.upload_success) {
            this.snackBar.open('Aufgabe ' + name + ' bearbeitet', 'OK', {duration: 3000});
          } else {
            this.snackBar.open('Fehler beim upload der Lösungs Datei', 'OK', {duration: 5000});
          }
        });
      }
    });
  }

  /**
   * Only Admin can update this information. At least one of the parameter is required.
   * @param id
   * @param name
   * @param description
   * @param supported_formats
   * @param machine_port
   * @param machine_ip
   */
  adminUpdateTestsysteme(id: number, name: string, description: string, supported_formats: string,
                         machine_port: number, machine_ip: number): Observable<Success> {
    return this.http.put<Success>('/api/v1/testsystems/' + id, {
      id: id, name: name, description: description,
      supported_formats: supported_formats, machine_port: machine_port, machine_ip: machine_ip
    });
  }


  // DELETE REQUESTS


  /**
   * Delete a course
   * @param id of course which will be deleted
   */
  deleteCourse(id: number) {
    return this.http.delete('/api/v1/courses/' + id);
  }

  /**
   * Deletes an existing task
   * @param idTask This is an unique id every task has
   */
  deleteTask(idTask: number) {
    return this.http.delete('/api/v1/tasks/' + idTask);
  }

  /**
   * (Only) Admin can delete a registered user by its userid.
   * @param userID
   */
  adminDeleteUser(userID: number): Observable<{ deletion: boolean }> {
    return this.http.delete<{ deletion: boolean }>('/api/v1/users/' + userID);
  }

  /**
   * Only Admin can delete this information.
   * @param id
   */
  adminDeleteTestsysteme(id: number): Observable<Success> {
    return this.http.delete<Success>('/api/v1/testsystems/' + id);
  }


}

export interface RoleChanged {
  grant: string;
  success: boolean;
}

export interface CourseDetail {
  course_id: number;
  course_name: string;
  course_description: string;
  creator: number;
  tasks: Task[];
}

export interface Task {
  course_id: number;
  task_description: string;
  task_id: number;
  task_name: string;
}

interface Result {
  'submit_date': Date;
  'result': string;
  'submission_data': Date;
  'task_name': string;
  'passed': number;
  'user_id': number;
  'result_date'?: Date;
  'filename'?: string;
  'message'?: string;
  'course_id': number;
  'task_id': number;
  'submission_id': number;

}

export interface SubmitResult {
  success: boolean;
  taskid: number;
  submissionid: number;
  upload_url: string;
}

// Student
export interface DashboardInformation {
  course_description: string;
  submit_date: Date;
  result?: string;
  task_name: string;
  passed: number;
  result_date?: Date;
  course_name: string;
  message?: string;
  course_id: number;
  task_id: number;
  task_description: string;
  submission_id: number;
}

export interface User {
  email: string;
  username: string;
  surname: string;
  role_id: number;
  user_id: number;
  prename: string;
  last_login?: Date;
}

export interface Success {
  success?: boolean;
  revoke?: boolean;
}


// Prof Dashboard

export interface ProfDashboard {
  course_description: string;
  course_id: number;
  course_name: string;
  creator: number;
  submissions: Submission[];
}

export interface Submission {
  email: string;
  passed: number;
  prename: string;
  surname: string;
  result: string;
  submission_id: number;
  user_id: number;
  username: string;

}

export interface NewTaskFileUpload {
  success: boolean;
  taskid: number;
  upload_url: string;
}

export interface CourseTableItem {
  course_name: string;
  course_description: string;
  course_id: number;
  course_semester: string;
  course_modul_id: string;
  role_name: string;
  role_id: number;
  course_tutor: CourseTableUser[];
  course_docent: CourseTableUser[];
}

export interface CourseTableUser {
  user_id: number;
  prename: string;
  surname: string;
  email: string;
}
