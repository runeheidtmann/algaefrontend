// Utilities
import fetchWrapper from '@/helpers/fetchWrapper';
import { defineStore } from 'pinia';

const baseURL = import.meta.env.VITE_API_BASE_URL

export const useAppStore = defineStore('appStore', {
    state: () => ({
        documents: [],
        rag_conversation: {},
        sessionId: null,
        chatHistory: [],
        isLoadingHistory: false,
        historyError: null,
        chatSessions: [],
        isLoadingSessions: false,
    }),

    actions: {
        async fetchChatSessions() {
            this.isLoadingSessions = true;
            
            try {
                const response = await fetchWrapper(`${baseURL}/api/chat-sessions/`, {
                    method: 'GET'
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                this.chatSessions = data || [];
                console.log('Chat sessions loaded:', this.chatSessions);
                
                return data;
            } catch (error) {
                console.error('Error fetching chat sessions:', error);
                throw error;
            } finally {
                this.isLoadingSessions = false;
            }
        },
        async createNewSession() {
            try {
                const response = await fetchWrapper(`${baseURL}/api/chat-sessions/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title: 'New Chat' })
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const newSession = await response.json();
                this.chatSessions.unshift(newSession);
                this.sessionId = newSession.id;
                this.chatHistory = [];
                this.rag_conversation = {};
                
                return newSession;
            } catch (error) {
                console.error('Error creating new session:', error);
                throw error;
            }
        },
        async generateSessionTitle(sessionId) {
            try {
                const response = await fetchWrapper(`${baseURL}/api/chat-sessions/generate-title/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Update local state with new title
                const session = this.chatSessions.find(s => s.id === sessionId);
                if (session && data.title) {
                    session.title = data.title;
                }
                
                return data;
            } catch (error) {
                console.error('Error generating session title:', error);
                // Don't throw - this is a background operation
            }
        },
        async deleteSession(sessionId) {
            try {
                const response = await fetchWrapper(`${baseURL}/api/chat-sessions/${sessionId}/`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                // Remove from local state
                this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
                
                // If we deleted the current session, reset state
                if (this.sessionId === sessionId) {
                    this.sessionId = null;
                    this.chatHistory = [];
                    this.rag_conversation = {};
                }
                
                return true;
            } catch (error) {
                console.error('Error deleting session:', error);
                throw error;
            }
        },
        async sendChatQuery(question) {
            // Initialize the conversation with the question and an empty answer
            this.rag_conversation = { "question": question, "answer": "" };
   
            try {
                // If no session exists, create one first
                if (!this.sessionId) {
                    await this.createNewSession();
                }
                
                // Prepare the FormData object with the question
                const formData = new FormData();
                formData.append('question', question);
                formData.append('session_id', this.sessionId);
        
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
                
                // Update chat history if available in response
                if (ragchatData.chat_history) {
                    this.chatHistory = ragchatData.chat_history;
                }

                // Check if we should generate a title for this session
                const currentSession = this.chatSessions.find(s => s.id === this.sessionId);
                if (currentSession && currentSession.title === 'New Chat') {
                    // Generate title in the background (don't await)
                    this.generateSessionTitle(this.sessionId);
                }
         
            } catch (error) {
                console.error('Error chatting:', error);
                throw error;
            }
        },
        async fetchChatHistory() {
            // Don't fetch if no session is selected
            if (!this.sessionId) {
                this.chatHistory = [];
                return null;
            }
            
            this.isLoadingHistory = true;
            this.historyError = null;
            
            try {
                const response = await fetchWrapper(`${baseURL}/api/chat/session/${this.sessionId}`, {
                    method: 'GET'
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Raw API response:', data);
                console.log('Messages from response:', data.messages);
                
                this.chatHistory = data.messages || [];
                console.log('Chat history stored in state:', this.chatHistory);
                
                // Optionally update conversation data if present
                if (data.question) {
                    this.rag_conversation = {
                        question: data.question,
                        answer: data.answer,
                        ...data
                    };
                }
                
                return data;
            } catch (error) {
                this.historyError = error.message || 'Failed to fetch chat history';
                console.error('Error fetching chat history:', error);
                throw error;
            } finally {
                this.isLoadingHistory = false;
            }
        },
        clearChatHistory() {
            this.chatHistory = [];
            this.rag_conversation = {};
        },
        resetState() {
            this.documents = [];
            this.rag_conversation = {};
            this.sessionId = null;
            this.chatHistory = [];
            this.isLoadingHistory = false;
            this.historyError = null;
            this.chatSessions = [];
            this.isLoadingSessions = false;
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
