import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {
  CourseTask, DashboardProf, DashboardStudent,
  DetailedCourseInformation, DetailedCourseInformationSingleTask,
  FileUpload,
  GeneralCourseInformation, GlobalSetting, ReSubmissionResult,
  RoleChanged,
  Succeeded, TaskExtension, TaskLastSubmission,
  Testsystem,
  TextType,
  User
} from '../interfaces/HttpInterfaces';
import {flatMap} from 'rxjs/operators';
import {saveAs as importedSaveAs} from 'file-saver';

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

  getTestsystemTypes(): Observable<Testsystem[]> {
    return this.http.get<Testsystem[]>('/api/v1/testsystems');
  }

  getTestsystemDetails(testsystem_id: string):  Promise<Testsystem> {
    return this.http.get<Testsystem>('/api/v1/testsystems/' + testsystem_id).toPromise();
  }

  updateTestsystem(testsystem_id: string, body: any): Promise<Succeeded> {
    return this.http.put<Succeeded>('/api/v1/testsystems/' + testsystem_id, body).toPromise();
  }

  postTestsystem(body: any): Promise<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/testsystems', body).toPromise();
  }

  deleteTestsystem(testsystem_id: string): Promise<Succeeded> {
    return this.http.delete<Succeeded>('/api/v1/testsystems/' + testsystem_id).toPromise();
  }

  /**
   * Get impressum or dataprivacy text
   * @param type The type of text
   */
  getPrivacyOrImpressumText(type: TextType): Observable<{ markdown: string }> {
    return this.http.get<{ markdown: string }>('/api/v1/legal/' + type.toString());
  }

  createNewSetting(key: string, value: string, typ: string) {
    return this.http.post<Succeeded>('/api/v1/settings' , {
        key: key,
        val: value,
        typ: typ,
        enable: true
    });
  }

  updateSetting(key: string, value: string, typ: string) {
    return this.http.put<Succeeded>(`/api/v1/settings/${encodeURI(key)}` , {
      val: value,
      typ: typ
    });
  }

  deleteSetting(key: string) {
    return this.http.delete<Succeeded>(`/api/v1/settings/${encodeURI(key)}` );
  }

  getAllSettings() {
    return this.http.get<GlobalSetting[]>(`/api/v1/settings` );
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
  getCourseDetail(courseID: number, permitted: boolean = false): Observable<DetailedCourseInformation> {
    return this.http.get<DetailedCourseInformation>(`/api/v1/courses/${courseID}?permitted=${permitted}`);
  }

  getCourseDetailOfTask(courseID: number, taskid: number, permitted: boolean = false): Observable<DetailedCourseInformationSingleTask> {
    return this.http.get<DetailedCourseInformationSingleTask>(`/api/v1/courses/${courseID}/tasks/${taskid}?permitted=${permitted}`);
  }

  /**
   * First this are only students - can be extended in backend easily
   */
  getSubscribedUsersOfCourse(courseID: number) {
    return this.http.get<User[]>(`/api/v1/courses/${courseID}/users`);
  }

  getSubmissionsOfUserOfTask(courseID: number, userid: number, taskid: number) {
    return this.http.get<Object>(`/api/v1/courses/${courseID}/submissions/user/${userid}/task/${taskid}`);
  }
  /**
   * Get all results of all users of all tasks
   * @param courseID of course to obtain all submissions
   * @param offset
   * @param limit
   */
  getAllUserSubmissions(courseID: number, offset: number, limit: number, filter: string): Observable<DashboardProf[]> {
    // tslint:disable-next-line:max-line-length
    return this.http.get<DashboardProf[]>(`/api/v1/courses/${courseID}/submissions?offset=${offset}&limit=${limit}&filter=${encodeURI(filter)}`);
  }

  getAllUserSubmissionsAsCSV(courseID: number) {
    return new Promise((resolve, reject) => {
      this.http.get('/api/v1/courses/' + courseID + '/submissions/csv', {responseType: 'arraybuffer'}).
      subscribe(response => {
        const blob = new Blob([response], {type: 'application/zip'});
        importedSaveAs(blob, `${courseID}_submission_csv.csv`);
        resolve('done');
      }, error => {
        reject(error);
      });
    });
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
    return this.http.get<TaskLastSubmission[]>('/api/v1/tasks/' + idTask + '/submissions');
  }

  reSubmitASubmission(taskid: number, subid: number, testsystems: string[]) {
    return this.http.post(`/api/v1/tasks/${taskid}/submissions/${subid}/resubmit`, {
      'testsystems': testsystems
    });
  }

  getReSubmissionResults(taskid: number, subid: number) {
    return this.http.get<ReSubmissionResult[]>(`/api/v1/tasks/${taskid}/submissions/${subid}/resubmit`);
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

  public downloadExtendedTaskInfo(taskInfo: TaskExtension) {
    // tslint:disable-next-line:max-line-length
    return this.http.get(`/api/v1/tasks/${taskInfo.taskid}/extended/${taskInfo.subject}/user/${taskInfo.userid}/file` , {responseType: 'arraybuffer'}).
    subscribe(response => {
      const blob = new Blob([response], {type: 'application/zip'});
      const parts = taskInfo.data.split('/');
      importedSaveAs(blob, parts[parts.length - 1]);
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
   * upload a plagiat script
   * @param data File
   * @param courseid unqie course id
   */
  submitPlagiatScript(data: File, courseid: number): Observable<Succeeded> {
    const formDataFile = new FormData();
    formDataFile.append('file', data, data.name);
    const upload_url = `/api/v1/courses/${courseid}/plagiatchecker/upload`;
    return this.http.post<Succeeded>(upload_url, formDataFile, {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    });
  }

  /**
   * Lecturer creates a new Task
   * @param idCourse The id of course where task will be added
   * @param name This is the name of the Task
   * @param description This is the description of the task
   * @param files This will be the solution files from Lecturer
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   * @param deadline The deadline when this tasks ends
   */
  createTask(idCourse: number, name: string, description: string,
             files: {}, testsystems: string[], deadline: Date, load_external_description: Boolean) {

    return this.http.post<FileUpload>('/api/v1/courses/' + idCourse + '/tasks', {
      name: name,
      description: description,
      testsystems: testsystems,
      deadline: this.formatDate(deadline),
      load_external_description: load_external_description
    }).pipe(
      flatMap(result => {

        if (result.success) {
          const upload_url: string = result.upload_url;
          const uploadRequests = [];

          // New solution file
          Object.keys(files).forEach(pos => {
            const formData = new FormData();
            for (const j in files[pos]) {
              formData.append('file', files[pos][j].item(0), j);
            }

            uploadRequests.push(this.http.post<Succeeded>(upload_url[pos], formData, {
              headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
            }).toPromise());
          });

          return new Promise((resolve, reject) => {
            Promise.all(uploadRequests)
              .then((success) => {
                resolve(result);
              }).catch((e) => {
                reject(e);
            });
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
   * access the download url for submission exports
   * @param courseID
   * @param courseName
   */
  exportCourseSubmissions(courseID: number, courseName: string) {
    const name = courseName.replace(/ /g, '').replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '').substr(0, 10);
    return this.http.get(`/api/v1/courses/${courseID}/export/zip`, {responseType: 'arraybuffer'}).
    subscribe(response => {
      const blob = new Blob([response], {type: 'application/zip'});
      importedSaveAs(blob, `course_export_${courseID}_${name}.zip`);
    });
  }

  importCompleteCourse(files: File[]) {
    const file = files[0];
    const formDataFile = new FormData();
    formDataFile.append('file', file, file.name);
    return this.http.post<Succeeded>(`/api/v1/courses/import`, formDataFile, {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    }).toPromise();

  }

  recoverCourse(courseID: number, files: File[]) {
    const file = files[0];
    const formDataFile = new FormData();
    formDataFile.append('file', file, file.name);
    return this.http.post<Succeeded>(`/api/v1/courses/${courseID}/recover`, formDataFile, {
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
    }).toPromise();
  }

  setNewPWOfGuestAccount(userid: number, password: string, password_repeat) {
    return this.http.put<Succeeded>(`/api/v1/users/${userid}/passwd`, {passwd: password, passwd_repeat: password_repeat});
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
   * Admin can create guest account
   * @param username The username of guest account
   * @param password Password guest account uses
   * @param roleID The role user gets
   * @param prename Prename of user
   * @param surname Surname of user
   * @param email Email of user
   */
  createGuestUser(username: string, password: string, roleID: number,
                  prename: string, surname: string, email: string): Observable<Succeeded> {
    return this.http.post<Succeeded>('/api/v1/users', {
      role_id: roleID,
      prename: prename,
      surname: surname,
      password: password,
      email: email,
      username: username
    });
  }

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
   * Transforms date to milliseconds since Unix epoch.
   * @param date to transform.
   * @return milliseconds since Unix epoch.
   */
  private formatDate(date: Date): number {
    return date.getTime()
  }

  /**
   * Lecturer updates an given Task
   * @param idTask The unique id of task to update
   * @param name This is the new name of the updated task
   * @param description This is the description of updated task
   * @param files This is the solution files of updated Task
   * @param test_type This is the type of this Task. Example (SQL, JAVA, etc...)
   * @param deadline The deadline when this task ends
   */
  updateTask(idTask: number, name: string,
             description: string, files: {}, test_type: string, deadline: Date, load_external_description: boolean): Observable<any> {

    if (files) {
      return this.http.put<FileUpload>('/api/v1/tasks/' + idTask, {
        name: name,
        description: description,
        test_type: test_type,
        deadline: this.formatDate(deadline),
        load_external_description: load_external_description
      }).pipe(
        flatMap(res => {
          if (res.success && Object.keys(files).length > 0) {
            const uploadUrl: string = res.upload_url;
            const uploadRequests = [];

            // New solution file
            const filesKeys = Object.keys(files);

            for (const filesKeyPos in filesKeys) {
              const pos = filesKeys[filesKeyPos];
              const formData = new FormData();
              if (typeof files[pos] == 'undefined') { continue; }
              for (const j in files[pos]) {
                formData.append('file', files[pos][j].item(0), j);
              }

              uploadRequests.push(this.http.post<Succeeded>(uploadUrl[pos], formData, {
                headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
              }).toPromise());
            }

            return new Promise((resolve, reject) => {
              Promise.all(uploadRequests)
                .then((success) => {
                  resolve(res);
                }).catch((e) => {
                  reject(e);
                });
            });


            /*return this.http.post<Succeeded>(uploadUrl, formData, {
              headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
            }).pipe(flatMap(
              res => {
                return of({success: res.success, fileupload: true})
              }
            ))*/

          } else {
            return of({success: true, fileupload: false});
          }
        }));
    } else {
      return this.http.put<Succeeded>('/api/v1/tasks/' + idTask, {
        name: name,
        description: description,
        test_type: test_type,
        deadline: this.formatDate(deadline)
      });
    }
  }

  triggerExternalInfo(task_id: number, testsystem: string): Observable<Succeeded> {
    return this.http.post<Succeeded>(`/api/v1/tasks/${task_id}/info/${testsystem}/trigger`, {});
  }

  /// **
  // * Admin updated impressum or data privacy
  // * @param type What should be updated
  // * @param text The updated Text
  // */
  // updatePrivacyOrImpressum(type: TextType, text: string): Observable<Succeeded> {
  //  return this.http.put<Succeeded>('/api/v1/settings/privacy/text', {which: type.toString(), content: text});
  // }


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


  // Services for course parameters

  /**
   * Docent, Tutor, ... can get all course parameters
   * @param courseid
   */
  getAllCourseParameters(courseid: number) {
    return this.http.get('/api/v1/courses/' + courseid + '/parameters').toPromise();
  }

  /**
   * delete a course parameter
   * @param courseid course ID
   * @param key parameter key
   */
  deleteCourseParameter(courseid: number, key: string) {
    return this.http.delete('/api/v1/courses/' + courseid + '/parameters/' + key).toPromise();
  }

  markTaskAsPassed(taskid: number, subid: number) {
    return this.http.post<Succeeded>(`/api/v1/tasks/${taskid}/submissions/${subid}/passed`, {});
  }

  /**
   * set and update a course parameter
   * @param courseid course ID
   * @param key parameter key
   * @param description
   */
  addUpdateCourseParameter(courseid: number, key: string, description: string) {
    return this.http.post('/api/v1/courses/' + courseid + '/parameters',
      {'description': description, 'key': key}).toPromise();
  }

  /**
   * get all user values of course parameters
   * @param courseid
   */
  getAllCourseParametersOfUser(courseid: number) {
    return this.http.get('/api/v1/courses/' + courseid + '/parameters/users').toPromise();
  }

  /**
   * set and update a course parameter for user
   * @param courseid course ID
   * @param key parameter key
   * @param value
   */
  addUpdateCourseParameterUser(courseid: number, key: string, value: string) {
    return this.http.post('/api/v1/courses/' + courseid + '/parameters/users',
      {'value': value, 'key': key}).toPromise();
  }

  runAllCourseTaskByDocent(courseid: number, taskid: number) {
    return this.http.post(`/api/v1/courses/${courseid}/run/tasks/${taskid}`,
    {'complete': true}).toPromise();
  }
}
