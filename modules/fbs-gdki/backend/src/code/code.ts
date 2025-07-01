import { JwtPayload } from "jsonwebtoken";
import JupyterKernelClient from "../jupyter/jupyter";
import { generateRandomString } from "../utils";
import * as mongoDB from "mongodb";
import { connect } from "../db/mongo";
import axios, { type AxiosResponse } from 'axios'
import { task } from "../model/model";

export async function executePythonCode(userData: JwtPayload, taskId: string, code: string) {
    const jup = new JupyterKernelClient();
    const res = await jup.startKernel();
    const response = await jup.executeCode(code);
    return response;
}

export async function generateHint(userData: JwtPayload, taskId: string, code: string) {
    const database: mongoDB.Db = await connect();
    const taskCollection = database.collection("tasktexts");
    
    const query = {
        _id: new mongoDB.ObjectId(taskId)
    }
    const task = await taskCollection.findOne(query) as any;
    const taskText = task.text;
    const answer = task.example;
    const result = await executePythonCode(userData, taskId, code);
    let resultText = "";
    console.log(result);
    if(result.status === "error") {
        resultText = result.error?.name + "\n" + result.error?.message;
    } else {
        if(result.results.length === 0) {
            resultText = ""
        } else {
            resultText = result.results[0].text;
        }
    }
    const prompt = generatePrompt(code, resultText, taskText, answer);
    const url = process.env.LLM_URL
    const req = {
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [
            {
            role: 'system',
            content: 'You are an expert programming tutor helping students with exercises. Your role is to provide hints only—no direct solutions.'
            },
            {
            role: 'user',
            content: prompt
            }
        ],
        temperature: 0.7,
        top_p: 0.8,
        repetition_penalty: 1.05,
        max_tokens: 512
    };
    if(url === undefined) {
        return 500;
    }
    try {
        const result = await axios.post(url, req,  {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(result);
        return result.data;
    } catch (error) {
        console.log(error)
        return 500;
    }
}

function generatePrompt(code: string, result: string, taskText: string, answer: string) {
    let prompt: string = "Follow these rules strictly: \
        1. NEVER write or complete the student’s code. \
        2. ONLY provide guiding hints, explanations, or questions. \
        3. For errors: Explain the issue, but don’t fix it. \
        4. For working code: Suggest improvements via questions (e.g., \"Have you considered...?\"). \
        5. Output in JSON (format below). \
        6. Do not return the Example Answer. \
        **Exercise**: {exercise} \
        **Student's Attempt**: {attempt} \
        **Example Answer**: {answer} \
        **Output Language**: {language} \
        Response Requirements: \
        Error Analysis (if errors exist): Briefly explain the issue. Only inculde it if the error stops the code from running or is very egrigous.\
        Concept Hint: A nudge toward the solution (not the answer). \
        Suggested Improvement: A question or hint for better approach.  \
        If no clear path to the goal is visible, try to nudge the user twowards the Example Answer.\
        If the provided code already produces the correct result, do not produce any hints or improvement. Just mention the success.\
        The output should be in JSON format, with the following scheme.  \
        {  \
        \"Error Analysis\": \"<if applicable>\",  \
        \"Concept Hint\": \"<general guidance>\",  \
        \"Suggested Improvement\": \"<question/hint>\"  \
        }  \
        Examples for correct Responses in English:  \
        Example (Python Error):  \
        {  \
        \"Error Analysis\": \"NameError: \'DecisionTreeClassifier\' is not defined. This usually means the class wasn’t imported correctly.\",  \
        \"Concept Hint\": \"In scikit-learn, you must import specific classes or reference them via module paths.\",  \
        \"Suggested Improvement\": \"How might you adjust the imports to access DecisionTreeClassifier?\"  \
        } \
        Example (Working Code Improvement):  \
        { \
        \"Error Analysis\": \"None\", \
        \"Concept Hint\": \"Your model trains successfully! Now, consider how to evaluate its performance.\", \
        \"Suggested Improvement\": \"Have you thought about adding a test set or metrics like accuracy_score?\" \
        } \
        "
    prompt = prompt.replace(/{exercise}/g, taskText)
    .replace(/{attempt}/g, code)
    .replace(/{answer}/g, answer)
    .replace(/{language}/g, "German");
    return prompt
}