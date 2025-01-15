import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TemplatesState } from "./templates.reducer";

export const selectTemplatesState =
  createFeatureSelector<TemplatesState>("templates");

export const selectAllTemplates = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.templates
);
export const selectAllCategories = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.categories
);
export const selectTemplatesError = createSelector(
  selectTemplatesState,
  (state: TemplatesState) => state.error
);
