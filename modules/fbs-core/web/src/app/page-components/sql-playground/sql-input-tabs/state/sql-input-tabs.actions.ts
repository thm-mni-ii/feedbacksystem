import { createAction, props } from "@ngrx/store";
import { QueryTab } from "../../../../model/sql_playground/QueryTab";
import { AwarenessState } from "../../collab/backend.service";

export const addTab = createAction(
  "[SQL Input Tabs] Add Tab",
  props<{ tab?: QueryTab }>()
);
export const closeTab = createAction(
  "[SQL Input Tabs] Close Tab",
  props<{ index: number }>()
);
export const closeAllTabs = createAction("[SQL Input Tabs] Close All Tabs");
export const updateTabContent = createAction(
  "[SQL Input Tabs] Update Tab Content",
  props<{ index: number; content: string }>()
);
export const updateTabName = createAction(
  "[SQL Input Tabs] Set Name",
  props<{ index: number; name: string }>()
);
export const setActiveTab = createAction(
  "[SQL Input Tabs] Set Active Tab",
  props<{ index: number }>()
);
export const changeCourse = createAction(
  "[SQL Input Tabs] Change Course",
  props<{ index: number; course: any }>()
);
export const changeTask = createAction(
  "[SQL Input Tabs] Change Task",
  props<{ index: number; task: any }>()
);
export const loadTabsFromLocalStorage = createAction(
  "[SQL Input Tabs] Load Tabs From Local Storage"
);
export const loadTabsFromLocalStorageSuccess = createAction(
  "[SQL Input Tabs] Load Tabs From Local Storage Success",
  props<{ tabs: any }>()
);
export const saveTabsToLocalStorage = createAction(
  "[SQL Input Tabs] Save Tabs To Local Storage"
);
export const saveTabsToLocalStorageSuccess = createAction(
  "[SQL Input Tabs] Save Tabs To Local Storage Success"
);
export const downloadFile = createAction(
  "[SQL Input Tabs] Download File",
  props<{ index: number }>()
);
export const downloadFileSuccess = createAction(
  "[SQL Input Tabs] Download File Success"
);
export const downloadAllFiles = createAction(
  "[SQL Input Tabs] Download All Files"
);
export const downloadAllFilesSuccess = createAction(
  "[SQL Input Tabs] Download All Files Success"
);
export const submission = createAction(
  "[SQL Input Tabs] Submission",
  props<{ index: number }>()
);
export const submissionFailure = createAction(
  "[SQL Input Tabs] Submission Failure"
);
export const submissionSuccess = createAction(
  "[SQL Input Tabs] Submission Success"
);
export const submissionToTask = createAction(
  "[SQL Input Tabs] Submission To Task",
  props<{ index: number }>()
);
export const submissionToTaskSuccess = createAction(
  "[SQL Input Tabs] Submission To Task Success",
  props<{ taskId: number }>()
);
export const waitForSubDone = createAction(
  "[SQL Input Tabs] Wait For Sub Done",
  props<{ index: number; sid: number }>()
);
export const waitForSubDoneSuccess = createAction(
  "[SQL Input Tabs] Wait For Sub Done Success"
);
export const updateMode = createAction(
  "[SQL Input Tabs] Update Mode",
  props<{ index: number; value: boolean }>()
);

// Newly introduced actions
export const setPending = createAction(
  "[SQL Input Tabs] Set Pending",
  props<{ pending: boolean }>()
);
export const setSubmissionResult = createAction(
  "[SQL Input Tabs] Set Submission Result",
  props<{ isCorrect: boolean; error: boolean; errorMsg: string | null }>()
);
export const submitStatement = createAction(
  "[SQL Input Tabs] Submit Statement",
  props<{ content: string }>()
);
export const waitForSubDoneFailure = createAction(
  "[SQL Input Tabs] Wait For Sub Done Failure"
);
export const submissionToTaskFailure = createAction(
  "[SQL Input Tabs] Submission To Task Failure"
);
export const updateActiveTabUsers = createAction(
  "[SQL Input Tabs] Update Active Tab Users",
  props<{ awarenessStates: AwarenessState[] }>()
);
