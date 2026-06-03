import { createReducer, on } from "@ngrx/store";
import {
  Template,
  TemplateLanguage,
} from "../../../../model/sql_playground/Template";
import { TemplateCategory } from "../../../../model/sql_playground/TemplateCategory";
import {
  addCategories,
  addTemplates,
  setFilterLanguage,
} from "./templates.actions";

export interface TemplatesState {
  templates: Template[];
  categories: TemplateCategory[];
  filterLanguage: TemplateLanguage;
  error: any;
}

export const initialState: TemplatesState = {
  templates: [],
  categories: [],
  filterLanguage: "postgres",
  error: null,
};

export const templatesReducer = createReducer(
  initialState,
  on(addTemplates, (state, { templates }) => ({
    ...state,
    templates: [...state.templates, ...templates],
  })),
  on(addCategories, (state, { categories }) => ({
    ...state,
    categories: [...state.categories, ...categories],
  })),
  on(setFilterLanguage, (state, { filterLanguage }) => ({
    ...state,
    filterLanguage,
  }))
);
