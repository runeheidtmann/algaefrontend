// Utilities
import fetchWrapper from '@/helpers/fetchWrapper';
import { defineStore } from 'pinia';

const baseURL = import.meta.env.VITE_API_BASE_URL

export const useAppStore = defineStore('appStore', {
    state: () => ({
        documents: [],
        rag_conversation: {},
    }),

    actions: {
        async sendChatQuery(question) {
            // Initialize the conversation with the question and an empty answer
            this.rag_conversation = { "question": question, "answer": "" };
   
            try {
                // Prepare the FormData object with the question
                const formData = new FormData();
                formData.append('question', question);
        
                // API call to /api/ragchat with the same question
                const ragchatResponse = await fetchWrapper(`${baseURL}/api/ragchat/`, {
                    method: 'POST',
                    body: formData 
                });
        
                // Check if the ragchat response is ok, otherwise throw an error
                if (!ragchatResponse.ok) {
                    throw new Error(`Error: ${ragchatResponse.statusText}`);
                }
        
                // Parse the response data from the second endpoint
                const ragchatData = await ragchatResponse.json();
                console.log(ragchatData)
                
                // Save the responses in store
                this.rag_conversation = ragchatData;
               
                
         
            } catch (error) {
                console.error('Error chatting:', error);
                throw error;
            }
        },
        async sendEvaluation(user_rating, LLM) {

            // Save data in object
            const evaluationData = {
                // Question
                user_question_raw: this.rag_conversation['question'],
                
                // Save context if it is the RAG conversation.
                user_question_enriched: this.rag_conversation['prompt'],
                
                // Which LLM does it come from?
                LLM_answer: this.rag_conversation['answer'],
                
                // Rating
                user_rating: user_rating,
                
                // LLM number
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

      
    },
})
