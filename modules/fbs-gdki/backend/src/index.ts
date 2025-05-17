import express from "express";
import cors from "cors";
import storeRoutes from './routes/storeRoutes';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const port = 3333;


async function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/store/', storeRoutes);
}
