import axios, { type AxiosResponse } from 'axios'

class StoreService {
    async sendText(task, code) {
        try {
            console.log(task);
            console.log(code);
            console.log(`Bearer ${localStorage.getItem('jsessionid')}`);
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
}

export default new StoreService()
