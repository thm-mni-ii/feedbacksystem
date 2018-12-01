import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  /**
   *  Service to communicate with db.
   *  Get submission result or submit for a given Task.
   *  Subscribe and unsubscribe a course.
   */

  //TODO: Replace fake data with real data
  constructor(private http: HttpClient) {
  }

  // Courses
  getCourses(): Course[] {
    // return this.http.get('/api/v1/courses');
    return [
      {
        courseID: 1,
        name: "Course 1",
        description: 'Course 1 Description'
      },
      {
        courseID: 2,
        name: "Course 2",
        description: "Course 2 Description"
      }
    ];
  }

  createCourse(name: string, description: string, standard_task_typ: number): Object {
    // return this.http.post('/api/v1/courses', {
    //   name: name,
    //   description: description,
    //   standard_task_typ: standard_task_typ
    // });
    return {message: "Course created"};
  }

  deleteCourse(id: number): Object {
    // return this.http.delete('/api/v1/courses/' + id);
    return {message: "Course deleted"};
  }

  updateCourse(id: number, name: string, description: string, standard_task_typ: number): Object {
    // return this.http.put('/api/v1/courses/' + id, {
    //   name: name,
    //   description: description,
    //   standard_task_typ: standard_task_typ
    // });
    return {message: "Course with" + id + " updated"};
  }

  // Deprecated getCourses has information about each course
  // getCourseDetail(id: number) {
  //   return this.http.get('/api/v1/courses/' + id);
  // }

  getAllCourses(): Course[] {
    // return this.http.get('/api/v1/courses/all');
    return [
      {
        courseID: 1,
        name: "Course 1",
        description: 'Course 1 Description'
      },
      {
        courseID: 2,
        name: "Course 2",
        description: "Course 2 Description"
      },
      {
        courseID: 3,
        name: "Course 3",
        description: "Course 3 Description"
      },
      {
        courseID: 4,
        name: "Course 4",
        description: "Course 4 Description"
      },
      {
        courseID: 5,
        name: "Course 5",
        description: "Course 5 Description"
      }
    ];
  }

  subscribeCourse(id: number): Object {
    // return this.http.post('/api/v1/courses/' + id + '/subscribe', {});
    return {message: "Subscribed course " + id};
  }

  unsubscribeCourse(id: number): Object {
    // return this.http.post('/api/v1/courses/' + id + '/unsubscribe', {});
    return {message: "Unsubscribed course " + id};
  }

  grantUserEdit(id: number, username: string): Object {
    // return this.http.post('/api/v1/courses/' + id + '/grant', {username: username, grant_type: 'edit'});
    return {message: "Granted user " + username + " edit rights"};
  }

  allUserSubmissions(id: number): Submission[] {
    // return this.http.get('/api/v1/courses/' + id + '/submissions');
    return [
      {
        submissionID: 1,
        data: "First Submission",
        result: 1
      },
      {
        submissionID: 2,
        data: "Second Submission",
        result: 0
      }
    ]
  }


  // Tasks
  createTask(idCourse: number, name: string, description: string, filename: string, test_type: number): Object {
    // return this.http.post('/api/v1/courses/' + idCourse + '/tasks', {
    //   name: name,
    //   description: description,
    //   filename: filename,
    //   test_type: test_type
    // });
    return {message: "Created task " + name + " in course " + idCourse};
  }

  updateTask(idCourse: number, idTask: number, name: string, description: string, filename: string, test_type: number): Object {
    // return this.http.put('/api/v1/courses/' + idCourse + '/tasks/' + idTask, {
    //   name: name,
    //   description: description,
    //   filename: filename,
    //   test_type: test_type
    // });
    return {message: "Updated task " + idTask + " in course " + idCourse};

  }

  deleteTask(idCourse: number, idTask: number): Object {
    // return this.http.delete('/api/v1/courses/' + idCourse + '/tasks/' + idTask);
    return {message: "Deleted task " + idTask + " in course " + idCourse};
  }

  getTaskDetail(idCourse: number, idTask: number): Task {
    // return this.http.get('/api/v1/courses/' + idCourse + '/tasks/' + idTask);
    return {
      courseID: 1,
      taskID: 1,
      name: "Task 1 in course 1",
      description: "This is the description of task 1 in course 1"
    };
  }


  getTaskResult(idCourse: number, idTask: number): Object {
    // return this.http.get('/api/v1/courses/' + idCourse + '/tasks/' + idTask + '/result');
    return {message: "Task result"}
  }

  submitTask(idCourse: number, idTask: number, data: String): Object {
    // return this.http.post('/api/v1/courses/' + idCourse + '/tasks/' + idTask + '/submit', {data: data});
    return {message: "Task " + idTask + " was submitted in course " + idCourse};
  }


  getTaskSubmissions(idCourse: number, idTask: number): Submission[] {
    // return this.http.get('/api/v1/courses/' + idCourse + '/tasks/' + idTask + '/submissions');
    return [
      {
        submissionID: 1,
        data: "First submission in task 1 course 1",
        result: 1
      },
      {
        submissionID: 2,
        data: "Second submission in task 1 course 1",
        result: 0
      }
    ];
  }


}


interface Course {
  courseID: number,
  name: string,
  description: string
}

interface Submission {
  submissionID: number,
  data: string,
  result: number
}

interface Task {
  courseID: number,
  taskID: number,
  name: string,
  description: string

}
