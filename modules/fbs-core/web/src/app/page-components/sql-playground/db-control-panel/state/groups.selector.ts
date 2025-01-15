import { createFeatureSelector, createSelector } from "@ngrx/store";
import { GroupsState } from "./groups.reducer";

export const selectGroupsState = createFeatureSelector<GroupsState>("groups");

export const selectAllGroups = createSelector(
  selectGroupsState,
  (state: GroupsState) => state.groups
);
export const selectGroupsError = createSelector(
  selectGroupsState,
  (state: GroupsState) => state.error
);
