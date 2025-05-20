import axios, { type AxiosResponse } from 'axios'

class StoreService {
    async sendText(task, code) {
        try {
            console.log(task);
            console.log(code);
            const response = await axios.put(`http://localhost:3333/store/api/v1/storeCode/${task}`, {
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
                },
                body: JSON.stringify({ text: code })
            });
            console.log('Response:', response);
        } catch (error) {
            console.error('Error sending request:', error);
        }
      }
}

export default new StoreService()
