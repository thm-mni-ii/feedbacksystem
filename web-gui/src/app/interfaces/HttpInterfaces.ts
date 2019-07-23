/**
 * Interfaces used when data comes from db
 */



/**
 * General information of course.
 * Used to show for list of Courses
 */
export interface GeneralCourseInformation {
  course_name: string;
  course_description: string;
  course_id: number;
  course_semester: string;
  course_modul_id: string;
  role_name: string;
  role_id: number;
  course_tutor: GeneralCourseDocent[];
  course_docent: GeneralCourseDocent[];
}

interface GeneralCourseDocent {
  user_id: number;
  prename: string;
  surname: string;
  email: string;
}

/**
 * Detailed information of course.
 * Used to show CourseTasks of one course
 */
export interface DetailedCourseInformation {
  course_id: number;
  course_name: string;
  course_description: string;
  role_name: string;
  role_id: number;
  creator: number;
  tasks: CourseTask[];
  standard_task_typ: string;
  course_module_id: string;
  course_semester: string;
  personalised_submission: boolean;
  course_end_date: string;
  plagiarism_script: boolean;
  course_docent: GeneralCourseDocent[];
  course_tutor: GeneralCourseDocent[];
}


export interface NewCourse{
  course_id: number;
  success: boolean;
}

/**
 * Task of one course
 */
export interface CourseTask {
  testsystem_id: string;
  submit_date?: Date;
  exitcode: number;
  result: string;
  submission_data: string;
  task_name: string;
  passed?: boolean;
  deadline: Date;
  result_date: Date;
  file: string;
  task_id: number;
  task_description: string;
  plagiat_passed: string;
  external_description: string;
  load_external_description: boolean;
}


/**
 * Information after user logged in.
 * Resend data comes when user needs to accept
 * privacy policy
 */
export interface AfterLogin {
  login_result: boolean;
  show_privacy: boolean;
  resend_data?: {
    username: string
  };
}

/**
 * Gives back if something succeeded
 */
export interface Succeeded {
  success: boolean;
}


/**
 * Gives back if Update Task succeeded
 */
export interface SucceededUpdateTask extends Succeeded{
  fileupload: boolean;
  success: boolean;
}

/**
 * For new task we get lots of information about testsystem and details
 */
export interface NewTaskInformation {
  course_id: string;
  deadline: Date;
  exitcode: number;
  file: string;
  passed: boolean;
  result: string;
  result_date: Date;
  submission_data: string;
  submit_date: Date;
  task_description: string;
  task_id: number;
  task_name: string;
  test_file_accept: boolean;
  test_file_accept_error: string;
  test_file_name: string;
  testsystem_id: string;
  no_reaction: boolean;
  plagiat_passed: string;
  external_description: string;
  load_external_description: boolean;
}

/**
 * After creating/submitting or updating a task,
 * response sends an upload url
 * to which the solution file should be uploaded.
 * Submission id only comes back if a submission is done.
 */
export interface FileUpload {
  success: boolean;
  taskid: number;
  submissionid: number;
  upload_url: string;
}

/**
 * Gives back which role admin has changed
 * and if it was successful
 */
export interface RoleChanged {
  grant: string;
  success: boolean;
}

/**
 * User information
 */
export interface User {
  email: string;
  username: string;
  surname: string;
  role_id: number;
  user_id: number;
  prename: string;
  last_login?: Date;
}

export interface Testsystem {
  name: string;
  testsystem_id: string;
  description: string;
  supported_formats: string;
  machine_port: string;
  machine_ip: string;
  testfiles: TestsystemTestfile[]
}

export interface TestsystemTestfile {
  required: boolean;
  filename: string;
}

export enum TextType {
  Dataprivacy = 'privacy_text',
  Impressum = 'impressum'
}

/**
 * Used to show matrix for student
 */
export interface DashboardStudent {
  course_description: string;
  course_name: string;
  tasks: Object[];
  course_modul_id: string;
  deadlines: string[];
  course_id: string;
  course_semester: string;
}

/**
 * Used to show matrix for docent
 */
export interface DashboardProf {
  passed: number;
  username: string;
  prename: string;
  surname: string;
  tasks: Object[];
  user_id: number;

}

export interface CourseParameter {
  course_id: number;
  c_param_desc: string;
  c_param_key: string;
}

export interface CourseParameterUser {
  course_id: number;
  value: string;
  c_param_key: string;
}
