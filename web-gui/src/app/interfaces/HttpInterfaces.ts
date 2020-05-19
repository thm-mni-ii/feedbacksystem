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


export interface NewCourse {
  course_id: number;
  success: boolean;
}

/**
 * Task of one course
 */
export interface CourseTask {
  testsystems: TaskTestsystem[];
  course_id: string;
  submit_date?: Date;
  exitcode: number;
  submission_data: string;
  task_name: string;
  combined_passed: string;
  deadline: Date;
  result_date: Date;
  file: string;
  task_id: number;
  task_description: string;
  plagiat_passed: string;
  evaluation: CourseTaskEvaluation[];
  external_description: string;
  load_external_description: boolean;
}

export interface TaskLastSubmission {
  evaluation: CourseTaskEvaluation[];
  email: string;
  combined_passed: boolean;
  submission_id: number;
  prename: string;
  surname: string;
  username: string;
  user_id: number;
}

export interface ReSubmissionResult {
  subid: string;
  ordnr: string;
  testsystem_id: string;
  result: string;
  test_file_accept: string;
  test_file_accept_error: string;
  test_file_name: string;
}

export interface TaskSubmission {
  evaluation: CourseTaskEvaluation[];
  filename: string;
  plagiat_passed: boolean;
  submission_data: string;
  submission_id: number;
  submit_date: Date;
  user_id: number;
}

export interface CourseTaskEvaluation {
  testsystem_id: string;
  exitcode: number;
  result: string;
  result_type: string;
  passed: boolean;
  result_date: Date;
  ordnr: number;
  submission_id: number;
  choice_best_result_fit?: string;
  calculate_pre_result?: string;
}

export interface DetailedCourseInformationSingleTask {
  course_id: number;
  course_name: string;
  course_description: string;
  role_name: string;
  role_id: number;
  creator: number;
  task: CourseTask;
  standard_task_typ: string;
  course_module_id: string;
  course_semester: string;
  personalised_submission: boolean;
  course_end_date: string;
  plagiarism_script: boolean;
  course_docent: GeneralCourseDocent[];
  course_tutor: GeneralCourseDocent[];
}

export interface TaskExtension {
  taskid:	number;
  userid:	number;
  subject: string;
  data:	string;
  info_typ:	string;
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
  fileupload?: boolean;
}


/**
 * Gives back if Update Task succeeded
 */
export interface SucceededUpdateTask extends Succeeded {
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
  combined_passed: string;
  result_date: Date;
  submission_data: string;
  submit_date: Date;
  task_description: string;
  task_id: number;
  task_name: string;
  test_file_accept: boolean;
  test_file_accept_error: string;
  test_file_name: string;
  testsystems: TaskTestsystem[];
  no_reaction: boolean;
  plagiat_passed: string;
  evaluation: CourseTaskEvaluation[];
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

export interface Ticket {
  id: number;
  title: string;
  desc: string;
  courseId: number;
  priority: number;
  status: string;
  timestamp: number;
  assignee: User;
  creator: User;
}

export interface ConfInvite {
  href: string;
  user: {
    username: string;
    prename: string;
    surname: string;
  };
  users: {
    username: string;
    prename: string;
    surname: string;
  }[];
}


export interface TaskTestsystem {
  name:	string;
  test_file_accept: boolean;
  test_file_accept_error: string;
  testsystem_id: string;
  description: string;
  machine_port: string;
  machine_ip: string;
  supported_formats: string;
  test_file_name: string;
  task_id: number;
  ordnr: number;
  accepted_input: number; // needs a calculation of what the input is accepted
}

export interface Testsystem {
  name: string;
  testsystem_id: string;
  description: string;
  supported_formats: string;
  machine_port: string;
  machine_ip: string;
  testfiles: TestsystemTestfile[];
  settings: string[];
  accepted_input: number;
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

export interface GlobalSetting {
  setting_key: string;
  setting_val: string;
  setting_typ: string;
}

export interface ConferenceInvitation {
  service: string;
  visibility: string;
  attendees: string[];
  href?: string;
  meetingId?: string;
  meetingPassword?: string;
  creator: User;
}
