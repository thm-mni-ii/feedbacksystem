import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const port = 3333;

app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

