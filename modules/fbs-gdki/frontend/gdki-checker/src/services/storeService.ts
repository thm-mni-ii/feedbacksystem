import axios, { type AxiosResponse } from 'axios'

class StoreService {
    async SaveCodeInTask(task, code) {
        try {
            const response = await axios.put(`http://localhost:3333/store/api/v1/storeCode/${task}`, {
                code 
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jsessionid')}`
                }
            }
            
        );
            console.log('Response:', response);
        } catch (error) {
            console.error('Error sending request:', error);
        }
      }
      async getCodeFromTask(task, code) {
        try {
            const response = await axios.get(`http://localhost:3333/store/api/v1/getCode/${task}`, {
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('jsessionid')}`
                }
            } 
        );
            console.log('Response:', response);
            return response;
        } catch (error) {
            console.error('Error sending request:', error);
        }
      }
}

export default new StoreService()
