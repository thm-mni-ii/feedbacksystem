import { createReducer, on } from "@ngrx/store";
import { Group } from "../../../../model/Group";
import {
  loadGroups,
  loadGroupsFailure,
  loadGroupsSuccess,
} from "./groups.actions";

export interface GroupsState {
  groups: Group[];
  error: any;
}

export const initialState: GroupsState = {
  groups: [],
  error: null,
};

export const groupsReducer = createReducer(
  initialState,
  on(loadGroups, (state) => ({ ...state })),
  on(loadGroupsSuccess, (state, { groups }) => ({ ...state, groups })),
  on(loadGroupsFailure, (state, { error }) => ({ ...state, error }))
);
