import { createAction, props } from "@ngrx/store";
import { Group } from "../../../../model/Group";

export const loadGroups = createAction("[Groups] Load Groups");
export const loadGroupsSuccess = createAction(
  "[Groups] Load Groups Success",
  props<{ groups: Group[] }>()
);
export const loadGroupsFailure = createAction(
  "[Groups] Load Groups Failure",
  props<{ error: any }>()
);
