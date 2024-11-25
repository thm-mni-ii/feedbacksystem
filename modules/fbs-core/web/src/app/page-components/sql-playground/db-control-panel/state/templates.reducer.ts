import { createReducer, on } from "@ngrx/store";
import { SqlTemplates } from "../../../../model/sql_playground/SqlTemplates";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";
import {
  loadTemplates,
  loadTemplatesSuccess,
  loadTemplatesFailure,
  loadCategories,
  loadCategoriesSuccess,
  loadCategoriesFailure,
} from "./templates.actions";

export interface TemplatesState {
  templates: SqlTemplates[];
  categories: TemplateCategory[];
  error: any;
}

export const initialState: TemplatesState = {
  templates: [],
  categories: [],
  error: null,
};

export const templatesReducer = createReducer(
  initialState,
  on(loadTemplates, (state) => ({ ...state })),
  on(loadTemplatesSuccess, (state, { templates }) => ({ ...state, templates })),
  on(loadTemplatesFailure, (state, { error }) => ({ ...state, error })),
  on(loadCategories, (state) => ({ ...state })),
  on(loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
  })),
  on(loadCategoriesFailure, (state, { error }) => ({ ...state, error }))
);
