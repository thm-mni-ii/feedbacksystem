import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
  CourseTask, DashboardStudent,
  DetailedCourseInformation,
  FileUpload,
  GeneralCourseInformation,
  RoleChanged,
  Succeeded,
  Testsystem,
  TextType,
  User
} from '../interfaces/HttpInterfaces';
import {flatMap} from 'rxjs/operators';

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


  constructor(private http: HttpClient) {
  }


  // GET REQUESTS


  getTestsystemTypes(): Observable<Testsystem[]> {
    return this.http.get<Testsystem[]>('/api/v1/testsystems');
  }


  /**
   * Get impressum or dataprivacy text
   * @param type The type of text
   */
  getPrivacyOrImpressumText(type: TextType): Observable<{ markdown: string }> {
    return this.http.get<{ markdown: string }>('/api/v1/settings/privacy/text?which=' + type.toString());
  }

  /**
   * Returns all courses an user subscribed to
   */
  getSubscribedCourses(): Observable<GeneralCourseInformation[]> {
    return this.http.get<GeneralCourseInformation[]>('/api/v1/courses');
  }

  /**
   * Returns all courses
   */
  getAllCourses(): Observable<GeneralCourseInformation[]> {
    return this.http.get<GeneralCourseInformation[]>('/api/v1/courses/all');
  }

  /**
   * Get detail of specific course
   * @param courseID of course to obtain task from
   */
  getCourseDetail(courseID: number): Observable<DetailedCourseInformation> {
    return this.http.get<DetailedCourseInformation>('/api/v1/courses/' + courseID);
  }


  /**
   * Get all results of all users of all tasks
   * @param courseID of course to obtain all submissions
   */
  getAllUserSubmissions(courseID: number): Observable<any> {
    return this.http.get<any>('/api/v1/courses/' + courseID + '/submissions');
  }

  /**
   * Return submission list for this task
   * @param taskID The id of task
   */
  getTaskResult(taskID: number): Observable<CourseTask> {
    return this.http.get<CourseTask>('/api/v1/tasks/' + taskID);
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

  getOverview(): Observable<DashboardStudent[]> {
    return this.http.get<DashboardStudent[]>('/api/v1/courses/submissions');
  }

  /**
   * get all registered users.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/v1/users');
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
   * @param course_end_date
   */
  createCourse(name: string, description: string, standard_task_typ: string, course_semester: string,
               course_modul_id: string, course_end_date: string, userDataAllowed: boolean): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses', {
      name: name,
      description: description,
      standard_task_typ: standard_task_typ,
      course_semester: course_semester,
      course_modul_id: course_modul_id,
      personalised_submission: userDataAllowed,
      course_end_date: course_end_date
    });
  }

  /**
   * User subscription to course with :id
   * @param courseID of course to subscribe
   */
  subscribeCourse(courseID: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + courseID + '/subscribe', {});
  }

  /**
   * User unsub course with :id
   * @param id of course to unsub
   */
  unsubscribeCourse(id: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + id + '/unsubscribe', {});
  }

  /**
   * User submits task as file or string
   * @param idTask of task that will be submitted
   * @param data that the user submits
   */
  submitTask(idTask: number, data: File | string): Observable<Succeeded> {
    if (data instanceof File) { // Data is file
      let upload_url: string;

      // File in form data
      const formDataFile = new FormData();
      formDataFile.append('file', data, data.name);

      // Ask for upload url and upload file
      return this.http.post<FileUpload>('/api/v1/tasks/' + idTask + '/submit', {}).pipe(
        flatMap(response => {
          if (response.success) {
            upload_url = response.upload_url;

            // Uploading the file
            return this.http.post<Succeeded>(upload_url, formDataFile, {
              headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
            });
          }
        }));
    } else { // Data is string
      return this.http.post<Succeeded>('/api/v1/tasks/' + idTask + '/submit', {data: data});
    }
  }

  /**
   * Lecturer creates a new Task
   * @param idCourse The id of course where task will be added
   * @param name This is the name of the Task
   * @param description This is the description of the task
   * @param files This will be the solution files from Lecturer
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   */
  createTask(idCourse: number, name: string, description: string, files: FileList, test_type: string): Observable<Succeeded> {

    // Solution file
    const formData = new FormData();
    for (let _i = 0; _i < files.length; _i++) {
      formData.append('file', files.item(_i), files.item(_i).name);
    }
    return this.http.post<FileUpload>('/api/v1/courses/' + idCourse + '/tasks', {
      name: name,
      description: description,
      testsystem_id: test_type
    }).pipe(
      flatMap(result => {
        let upload_url: string;
        if (result.success) {
          upload_url = result.upload_url;
          return this.http.post<Succeeded>(upload_url, formData, {
            headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
          });
        }
      })
    );
  }

  /**
   * Docent adds tutor to one of his courses
   * @param courseID The course where user will be add
   * @param userID The id of user to add
   */
  addTutorToCourse(courseID: number, userID: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + courseID + '/grant/tutor', {userid: userID});
  }

  /**
   * Docent removes tutor from his course
   * @param courseID The course where user will be removed
   * @param userID The id of user to remove
   */
  removeTutorFromCourse(courseID: number, userID: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + courseID + '/deny/tutor', {userid: userID});
  }

  /**
   * User get docent rights to course
   * @param courseID
   * @param userID
   */
  addDocentToCourse(courseID: number, userID: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + courseID + '/grant/docent', {userid: userID});
  }

  /**
   * User loses docent rights to course
   * @param courseID
   * @param userID
   */
  removeDocentFromCourse(courseID: number, userID: number): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/courses/' + courseID + '/deny/docent', {userid: userID});
  }

  /**
   * Admin chooses user role
   * @param userID The id of user
   * @param userRole The next role user will have
   */
  changeUserRole(userID: number, userRole: number): Observable<RoleChanged> {
    return this.http.post<RoleChanged>('/api/v1/users/grant/' + userID, {role: userRole});
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
   * @param userDataAllowed Should the course be displayed to students or not
   */
  updateCourse(id: number, name: string, description: string, standard_task_typ: string, course_semester: string,
               course_module_id: string, userDataAllowed: boolean): Observable<Succeeded> {
    return this.http.put<Succeeded>('/api/v1/courses/' + id, {
      name: name,
      description: description,
      standard_task_typ: standard_task_typ,
      course_semester: course_semester,
      course_modul_id: course_module_id,
      personalised_submission: userDataAllowed
    });
  }

  /**
   * Lecturer updates an given Task
   * @param idTask The unique id of task to update
   * @param name This is the new name of the updated task
   * @param description This is the description of updated task
   * @param files This is the solution files of updated Task
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   */
  updateTask(idTask: number, name: string, description: string, files: FileList | null, test_type: string): Observable<Succeeded> {

    if (files) {
      // New solution file
      const formData = new FormData();
      for (let _i = 0; _i < files.length; _i++) {
        formData.append('file', files.item(_i), files.item(_i).name);
      }

      return this.http.put<FileUpload>('/api/v1/tasks/' + idTask, {
        name: name,
        description: description,
        test_type: test_type
      }).pipe(
        flatMap(res => {
          let uploadUrl: string;
          if (res.success) {
            uploadUrl = res.upload_url;
            return this.http.post<Succeeded>(uploadUrl, formData, {
              headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
            });
          }
        }));
    } else {
      return this.http.put<Succeeded>('/api/v1/tasks/' + idTask, {
        name: name,
        description: description,
        test_type: test_type
      });
    }
  }

  updatePrivacyOrImpressum(type: TextType, text: string): Observable<Succeeded> {
    return this.http.put<Succeeded>('/api/v1/settings/privacy/text', {which: type.toString(), content: text});
  }


  // DELETE REQUESTS


  /**
   * Delete a course
   * @param id of course which will be deleted
   */
  deleteCourse(id: number): Observable<Succeeded> {
    return this.http.delete<Succeeded>('/api/v1/courses/' + id);
  }

  /**
   * Deletes an existing task
   * @param idTask This is an unique id every task has
   */
  deleteTask(idTask: number): Observable<Succeeded> {
    return this.http.delete<Succeeded>('/api/v1/tasks/' + idTask);
  }

  /**
   * (Only) Admin can delete a registered user by its userid.
   * @param userID
   */
  adminDeleteUser(userID: number): Observable<Succeeded> {
    return this.http.delete<Succeeded>('/api/v1/users/' + userID);
  }

}
