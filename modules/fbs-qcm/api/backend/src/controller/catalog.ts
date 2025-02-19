import { addNewChildrenToQuestion, catalogScore, changeScoreNeededForQuestion, createSingleCatalog, deleteSingleCatalog, editCatalogInformation, editSingleCatalog, emptyCatalogInformation, getAllCatalogs, getPreviousQuestionInCatalog, getSingleCatalog } from "../catalog/catalog";
import { Request, Response } from "express";
import { getCurrentQuestion } from "../question/question";


const getCatalogScore = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const courseId = Number(req.params.courseId);
      const catalogId = req.params.catalogId;
      if (req.user !== undefined) {
        const data = await catalogScore(req.user, courseId, catalogId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});
const getCatalogs = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const courseId = Number(req.params.id);
      if (req.user !== undefined) {
        const data = await getAllCatalogs(req.user, courseId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
});
const deleteCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const catalogId = req.params.id as unknown as string;
      if (req.user !== undefined) {
        const data = await deleteSingleCatalog(req.user, catalogId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      res.sendStatus(500);
    }
  });
const putCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const course = requestData.course;
        const catalogId = req.params.id as string;
        delete requestData.course;
        const data = await editSingleCatalog(catalogId, token, requestData, req.user, course);
        if (data == -1) {
          res.sendStatus(403);
        }
        res.sendStatus(200);
      }
    } catch {
      res.sendStatus(500);
    }
  });
const postCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const authHeader = req.headers["authorization"];
        const token: any = authHeader && authHeader.split(" ")[1];
        const requestData = req.body;
        const course = requestData.course;
        delete requestData.course;
        const data = await createSingleCatalog(requestData, token, req.user, course);
        if (data !== -1) {
          res.send(data);
        } else {
          res.sendStatus(403);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const addChildrenToQuestion = ( async (req: Request, res:Response) => {
    try {
      if (req.user === undefined) {
        res.sendStatus(401);
      }
      if (req.user !== undefined) {
        const requestData = req.body;
        const questionId = requestData.question;
        const children = requestData.child;
        const transition = requestData.transition;
        const key = requestData.key;
        const result = await addNewChildrenToQuestion(req.user, questionId, children, key, transition)
        if(result === -1) {
          res.sendStatus(400);
          return
        }
        res.sendStatus(200);
    }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const editCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const questionId = req.params.id as string;
      const catalogId = req.params.catalog as string;
      if (req.user !== undefined) {
        const data = await editCatalogInformation(req.user, catalogId, questionId);
        if (data == -1) {
          res.sendStatus(403);
        } else {
          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const getCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const catalogId = req.params.id as string;
      if (req.user !== undefined) {
        const data = await getSingleCatalog(req.user, catalogId);
        if (data == -1) {
          res.sendStatus(403);
        } else {

          res.send(data);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

const getPreviousQuestion = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401);
      }
      const questionId = req.params.question as string;
      const catalogId = req.params.catalog as string;
      if(req.user !== undefined) {
          const data = await getPreviousQuestionInCatalog(req.user, catalogId, questionId);
          if( data === -1) {
            res.send(403);
          } else { 
            res.send(data);
          }
      }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
  });
const editEmptyCatalog = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401); 
      }
      if (req.user !== undefined) {
        const catalogId = req.params.id as string;
        const result = await emptyCatalogInformation(req.user, catalogId);
        console.log(result);
        if(result === -1) {
            res.send({isEmpty: false});
            return;
        } 
        if(result === 0) {
            res.send({isEmpty: true});
            return;
        } 
        res.sendStatus(500);
      }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
  });
const currentQuestion = (async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401); 
      }
      if (req.user !== undefined) {
        const catalogId = req.body.ID as string;
        const result = await getCurrentQuestion(req.user, catalogId);
        console.log(result);
        res.send(result);
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });
const changeNeededScore = ( async (req: Request, res: Response) => {
    try {
      if (req.user == undefined) {
        res.sendStatus(401); 
      }
      if (req.user !== undefined) {
        const questionId = req.body.question as string;
        const score = Number(req.body.score);
        const transition = req.body.transition as string;
        console.log(questionId);
        console.log(score);
        console.log(transition);
        console.log(req.query);
        const result = await changeScoreNeededForQuestion(req.user, questionId, score, transition);
        if(result === -1) {
            res.sendStatus(500);
        } else {
            res.send(result);
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  });

export {
    getCatalogs,
    deleteCatalog,
    putCatalog,
    postCatalog,
    addChildrenToQuestion,
    editCatalog,
    getCatalog,
    getPreviousQuestion,
    editEmptyCatalog,
    currentQuestion,
    changeNeededScore,
    getCatalogScore
}
