import express from "express";
import cors from "cors";
import storeRoutes from './routes/storeRoutes';
import taskRoutes from './routes/taskRoutes';
import codeRoutes from './routes/codeRoutes';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}



async function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/store', storeRoutes);
    app.use('/tasks', taskRoutes);
    app.use('/code', codeRoutes);
    app.listen(3000, () => console.log("LISTENING on port 3000"));
}
startServer().catch(console.error);
