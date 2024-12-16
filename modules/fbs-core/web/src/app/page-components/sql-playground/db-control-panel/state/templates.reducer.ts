import { createReducer, on } from "@ngrx/store";
import { SqlTemplates } from "../../../../model/sql_playground/SqlTemplates";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";
import {
  addCategories,
  addTemplates,
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
  on(addTemplates, (state, { templates }) => ({ ...state, templates: [...state.templates, ...templates] })),
  on(addCategories, (state, { categories }) => ({ ...state, categories: [...state.categories, ...categories] })),
);
