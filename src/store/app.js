// Utilities
import fetchWrapper from '@/helpers/fetchWrapper';
import { defineStore } from 'pinia';

const baseURL = import.meta.env.VITE_API_BASE_URL

export const useAppStore = defineStore('appStore', {
    state: () => ({
        documents: [],
        conversation: {},
        rag_conversation: {},
    }),
    actions: {
        async sendChatQuery(question) {
            // Initialize the conversation with the question and an empty answer
            this.conversation = { "question": question, "answer": "" };
            this.rag_conversation = { "question": question, "answer": "" };
   
            try {
                // Prepare the FormData object with the question
                const formData = new FormData();
                formData.append('question', question);
        
                // First API call to /api/chat/
                const chatResponse = await fetchWrapper(`${baseURL}/api/chat/`, {
                    method: 'POST',
                    body: formData
                });
        
                // Check if the response is ok, otherwise throw an error
                if (!chatResponse.ok) {
                    throw new Error(`Error: ${chatResponse.statusText}`);
                }
        
                // Parse the response data from the first endpoint
                const chatData = await chatResponse.json();
        
                // Second API call to /api/ragchat with the same question
                const ragchatResponse = await fetchWrapper(`${baseURL}/api/ragchat/`, {
                    method: 'POST',
                    body: formData // Reusing the FormData object
                });
        
                // Check if the ragchat response is ok, otherwise throw an error
                if (!ragchatResponse.ok) {
                    throw new Error(`Error: ${ragchatResponse.statusText}`);
                }
        
                // Parse the response data from the second endpoint
                const ragchatData = await ragchatResponse.json();
                console.log(ragchatData)
                // Optional: Decide how to combine or choose between the responses
                // For this example, we'll just store the chatData as the conversation.
                // You might want to merge the responses or choose one based on some criteria.
                this.rag_conversation = ragchatData;
                this.conversation = chatData;
                
         
            } catch (error) {
                console.error('Error chatting:', error);
                throw error;
            }
        },
        async sendEvaluation(user_rating, LLM) {

            const evaluationData = {
                user_question_raw: this.conversation['question'],
                user_question_enriched: LLM == 2 ? this.rag_conversation['prompt'] : 'Not enriched',
                LLM_answer: LLM == 2 ? this.rag_conversation['answer'] : this.conversation['answer'],
                user_rating: user_rating,
                LLM: LLM
            };

            try {
                const response = await fetchWrapper(`${baseURL}/api/evaluations/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(evaluationData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
                }

            } catch (error) {
                console.error('Error evaluation:', error);
                throw error;
            }
        },


        async fetchUserDocuments() {
            try {
                const response = await fetchWrapper(`${baseURL}/api/documents/`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    throw new Error('Error fetching documents');
                }

                const data = await response.json();
                const documents = processDocuments(data);
                this.documents = documents;

            } catch (error) {
                console.error('Failed to fetch documents:', error);
            }
        },

        async uploadDocument(title, file) {
            try {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('file', file);

                const response = await fetchWrapper(`${baseURL}/api/upload-document/`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                await this.fetchUserDocuments();
                console.log("uploaded successfully");

            } catch (error) {
                console.error('Error uploading document:', error);
                throw error;
            }
        },
        resetConversation() {
            console.log("in here")
            this.conversation = {};
        },
    },
})

function processDocuments(inputData) {
    return inputData.map(data => {
        return {
            title: data.title,
            file: data.document_files.length > 0
                ? `<a href="${data.document_files[0].file}">${data.title}</a>`
                : 'No file available'
        };
    });
}
