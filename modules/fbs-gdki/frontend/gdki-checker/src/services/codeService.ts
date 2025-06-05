import axios, { type AxiosResponse } from 'axios'

class codeService {
    async executeCode(task, code) {
        try {
            const response = await axios.post(`http://localhost:3333/code/api/v1/executeCode/${task}`, {
                code 
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jsessionid')}`
                }
            }
        );
            return response;
        } catch (error) {
            console.error('Error sending request:', error);
        }
      }
}

export default new codeService()
