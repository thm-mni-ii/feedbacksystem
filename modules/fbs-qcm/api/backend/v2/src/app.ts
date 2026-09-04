import cors from "cors";
import express, { Express } from "express";
import { Db } from "mongodb";
import { createQuestionRouter } from "./question/question.routes";
import { createCompetencyRouter } from "./competency/competency.routes";
import { errorHandler } from "./shared/http";

/** Baut die Express-App auf, ohne sie zu starten. Von Tests direkt nutzbar. */
export function createApp(db: Db): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api_v2", createQuestionRouter(db));
  app.use("/api_v2", createCompetencyRouter(db));

  app.use(errorHandler);

  return app;
}
