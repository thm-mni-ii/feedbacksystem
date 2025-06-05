import { JwtPayload } from "jsonwebtoken";
import JupyterKernelClient from "../jupyter/jupyter";
import { generateRandomString } from "../utils";
import axios, { type AxiosResponse } from 'axios'

export async function executePythonCode(userData: JwtPayload, taskId: string, code: string) {
    console.log("WIr fangen an");
    const jup = new JupyterKernelClient();
    console.log("Wir starten den Bumms");
    const res = await jup.startKernel(generateRandomString(10));
    console.log("Der Bumms ist gestartet");
    console.log(res);
    const response = await jup.executeCode(code);
    console.log("Der Bumms wurde ausgeführt");
    console.log(response);
    return response;

}