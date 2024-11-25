import { createReducer, on } from "@ngrx/store";
import { QueryTab } from "src/app/model/sql_playground/QueryTab";
import * as SqlInputTabsActions from "./sql-input-tabs.actions";

export interface SqlInputTabsState {
  tabs: QueryTab[];
  activeTabIndex: number;
  pending: boolean;
}

const initialState: SqlInputTabsState = {
  tabs: [],
  activeTabIndex: 0,
  pending: false,
};

export const sqlInputTabsReducer = createReducer(
  initialState,
  on(SqlInputTabsActions.addTab, (state, { tab }) => ({
    ...state,
    tabs: [
      ...state.tabs,
      tab ?? {
        id: crypto.randomUUID(),
        name: "New Query",
        content: "",
        error: false,
        errorMsg: null,
        isCorrect: false,
        isSubmitted: false,
        isSubmitMode: false,
        selectedCourse: undefined,
        selectedTask: undefined,
        selectedCourseName: "Course",
        selectedTaskName: "Task",
        active: [],
      },
    ],
    activeTabIndex: state.tabs.length,
  })),
  on(SqlInputTabsActions.closeTab, (state, { index }) => {
    const tabs = state.tabs.filter((_, i) => i !== index);
    return {
      ...state,
      tabs,
      activeTabIndex: tabs.length - 1,
    };
  }),
  on(SqlInputTabsActions.closeAllTabs, (state) => ({
    ...state,
    tabs: [],
    activeTabIndex: 0,
  })),
  on(SqlInputTabsActions.updateTabContent, (state, { index, content }) => {
    let changed = false;

    const newTabs = state.tabs.map((tab, i) => {
      if (i === index && tab.content !== content) {
        changed = true;
        return { ...tab, content };
      } else {
        return tab;
      }
    });

    console.log("newTabs", newTabs);

    return changed
      ? {
          ...state,
          tabs: newTabs,
        }
      : state;
  }),
  on(SqlInputTabsActions.updateTabName, (state, { index, name }) => {
    let changed = false;

    const newTabs = state.tabs.map((tab, i) => {
      if (i === index && tab.name !== name) {
        changed = true;
        return { ...tab, name };
      } else {
        return tab;
      }
    });

    return changed
      ? {
          ...state,
          tabs: newTabs,
        }
      : state;
  }),
  on(SqlInputTabsActions.updateActiveTabUsers, (state, { awarenessStates }) => {
    const newTabs = state.tabs.map((tab) => {
      return {
        ...tab,
        active: awarenessStates
          .filter(({ stateId }) => stateId === tab.id)
          .map(({ user }) => user),
      };
    });

    return {
      ...state,
      tabs: newTabs,
    };
  }),
  on(SqlInputTabsActions.setActiveTab, (state, { index }) => ({
    ...state,
    activeTabIndex: index,
  })),
  on(SqlInputTabsActions.changeCourse, (state, { index, course }) => ({
    ...state,
    tabs: state.tabs.map((tab, i) =>
      i === index
        ? {
            ...tab,
            selectedCourse: course,
            selectedCourseName: course.name,
            selectedTask: undefined,
            selectedTaskName: "Task",
          }
        : tab
    ),
  })),
  on(SqlInputTabsActions.changeTask, (state, { index, task }) => ({
    ...state,
    tabs: state.tabs.map((tab, i) =>
      i === index
        ? { ...tab, selectedTask: task, selectedTaskName: task.name }
        : tab
    ),
  })),
  on(SqlInputTabsActions.loadTabsFromLocalStorageSuccess, (state, { tabs }) => {
    if (tabs.length > 0) {
      return {
        ...state,
        tabs: tabs,
        activeTabIndex: 0,
      };
    } else {
      return state;
    }
  }),
  on(SqlInputTabsActions.saveTabsToLocalStorage, (state) => state),
  on(SqlInputTabsActions.saveTabsToLocalStorageSuccess, (state) => state),
  on(SqlInputTabsActions.updateMode, (state, { index, value }) => ({
    ...state,
    tabs: state.tabs.map((tab, i) =>
      i === index ? { ...tab, isSubmitMode: value } : tab
    ),
  })),
  on(SqlInputTabsActions.submissionToTaskSuccess, (state, { taskId }) => ({
    ...state,
    taskId,
  })),
  on(SqlInputTabsActions.downloadFileSuccess, (state) => state),
  on(SqlInputTabsActions.downloadAllFilesSuccess, (state) => state),
  on(SqlInputTabsActions.submissionFailure, (state) => state),
  on(SqlInputTabsActions.submissionSuccess, (state) => state),
  on(SqlInputTabsActions.waitForSubDoneSuccess, (state) => state),

  // Newly introduced actions
  on(SqlInputTabsActions.setPending, (state, { pending }) => ({
    ...state,
    pending,
  })),
  on(
    SqlInputTabsActions.setSubmissionResult,
    (state, { isCorrect, error, errorMsg }) => ({
      ...state,
      tabs: state.tabs.map((tab, i) =>
        i === state.activeTabIndex
          ? { ...tab, isCorrect, error, errorMsg, isSubmitted: true }
          : tab
      ),
    })
  ),
  on(SqlInputTabsActions.submitStatement, (state, {}) => state),
  on(SqlInputTabsActions.waitForSubDoneFailure, (state) => state),
  on(SqlInputTabsActions.submissionToTaskFailure, (state) => state)
);
