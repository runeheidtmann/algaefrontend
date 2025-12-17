<template>
  <div class="chat-page">
    <!-- Messages Area - grows and scrolls with page -->
    <div class="messages-area">
      <!-- Empty State -->
      <div v-if="chatHistory.length === 0 && !rag_conversation.question" class="empty-state">
        <div class="empty-icon">
          <v-icon size="64" color="grey-lighten-1">mdi-chat-outline</v-icon>
        </div>
        <h2 class="text-h5 mb-2 text-grey-darken-1">How can I help you today?</h2>
        <p class="text-body-2 text-grey">Ask me anything about algae research</p>
      </div>

      <!-- Chat History Messages (excluding latest Q&A if shown separately) -->
      <div v-for="message in chatHistoryWithoutLatest" :key="message.id" class="message-wrapper">
        <div :class="['message-row', message.message_type === 'user' ? 'user-message' : 'assistant-message']">
          <div class="message-container">
            <div class="message-avatar">
              <v-avatar :color="message.message_type === 'user' ? 'primary' : 'grey-darken-2'" size="32">
                <span class="text-white text-body-2">{{ message.message_type === 'user' ? user_initials : 'AB' }}</span>
              </v-avatar>
            </div>
            <div class="message-content-wrapper">
              <div class="message-author">{{ message.message_type === 'user' ? 'You' : 'AlgaeBrain' }}</div>
              <div class="message-text">{{ message.content }}</div>
              <div class="message-timestamp">{{ formatTime(message.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Conversation (Question) -->
      <div v-if="rag_conversation.question" class="message-wrapper">
        <div class="message-row user-message">
          <div class="message-container">
            <div class="message-avatar">
              <v-avatar color="primary" size="32">
                <span class="text-white text-body-2">{{ user_initials }}</span>
              </v-avatar>
            </div>
            <div class="message-content-wrapper">
              <div class="message-author">You</div>
              <div class="message-text">{{ rag_conversation.question }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Conversation (Answer) -->
      <div v-if="rag_conversation.answer" class="message-wrapper">
        <div class="message-row assistant-message">
          <div class="message-container">
            <div class="message-avatar">
              <v-avatar color="grey-darken-2" size="32">
                <span class="text-white text-body-2">AB</span>
              </v-avatar>
            </div>
            <div class="message-content-wrapper">
              <div class="message-author">AlgaeBrain</div>
              <div class="message-text">{{ rag_conversation.answer }}</div>
              
              <!-- References Section -->
              <div v-if="vectorChunks.length > 0 || graphChunks.length > 0" class="references-section">
                <div class="references-title">
                  <v-icon size="16" class="mr-1">mdi-book-open-variant</v-icon>
                  References
                </div>
                
                <!-- Vector chunks -->
                <div class="reference-chips">
                  <v-chip
                    v-for="(item, index) in vectorChunks"
                    :key="'vector-' + index"
                    size="small"
                    @click="openDialog('vector', index)"
                    class="reference-chip"
                    variant="outlined"
                  >
                    <v-icon start size="14">mdi-file-document</v-icon>
                    {{ (item.metadata?.title || 'Untitled').slice(0, 40) }}...
                  </v-chip>
                  
                  <!-- Graph chunks
                  <v-chip
                    v-for="(item, index) in graphChunks"
                    :key="'graph-' + index"
                    size="small"
                    @click="openDialog('graph', index)"
                    class="reference-chip"
                    variant="outlined"
                  >
                    <v-icon start size="14">mdi-graph</v-icon>
                    {{ (item.metadata?.title || 'Untitled').slice(0, 40) }}...
                  </v-chip> -->
                </div>
              </div>

              <!-- Rating Component -->
              <div class="mt-3">
                <RatingComponent :LLM="2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="rag_conversation.question && !rag_conversation.answer" class="message-wrapper">
        <div class="message-row assistant-message">
          <div class="message-container">
            <div class="message-avatar">
              <v-avatar color="grey-darken-2" size="32">
                <span class="text-white text-body-2">AB</span>
              </v-avatar>
            </div>
            <div class="message-content-wrapper">
              <div class="message-author">AlgaeBrain</div>
              <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Input Area at Bottom -->
    <div class="input-area">
      <div class="input-container">
        <v-textarea
          v-model="chatInput"
          @keydown.enter.exact.prevent="sendQuery"
          placeholder="Message AlgaeBrain..."
          variant="outlined"
          rows="1"
          auto-grow
          hide-details
          class="chat-input"
          :disabled="loading"
          density="comfortable"
          bg-color="white"
        >
          <template v-slot:append-inner>
            <v-btn
              icon
              size="small"
              :disabled="!chatInput.trim() || loading"
              @click="sendQuery"
              :loading="loading"
              color="primary"
              variant="flat"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-textarea>
      </div>
      <div class="input-footer">
        <span class="text-caption text-grey">AlgaeBrain can make mistakes. Check important info.</span>
      </div>
    </div>

    <!-- Reference Dialog -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card v-if="activeItem">
        <v-card-title class="d-flex align-center bg-grey-lighten-4">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          {{ activeItem.metadata.title }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-6">
          <div class="metadata-grid">
            <div class="metadata-item">
              <div class="metadata-label">Authors</div>
              <div class="metadata-value">{{ activeItem.metadata.authors }}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Publication Date</div>
              <div class="metadata-value">{{ activeItem.metadata.publication_date }}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">File Name</div>
              <div class="metadata-value">{{ activeItem.metadata.file_name }}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Page</div>
              <div class="metadata-value">{{ activeItem.metadata.page }}</div>
            </div>
          </div>
          <v-divider class="my-4"></v-divider>
          <div class="metadata-item">
            <div class="metadata-label">Text Excerpt</div>
            <div class="metadata-value text-excerpt">{{ activeItem.page_content }}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/authStore";

import RatingComponent from "@/components/RatingComponent.vue";

export default {
  components: { RatingComponent },
  data() {
    return {
      loading: false,
      chatInput: "",
      appStore: null,
      authStore: null,
      dialog: false,
      activeItemIndex: null,
      activeItemType: null,
    };
  },
  methods: {
    async sendQuery() {
      if (!this.chatInput.trim()) return;
      
      const chatInputText = this.chatInput;
      this.loading = true;
      this.chatInput = "";
      
      try {
        await this.appStore.sendChatQuery(chatInputText);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        this.errorMessage = "Some error in with the send question-thingy";
      }
      this.loading = false;
    },
    scrollToBottom() {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    },
    async loadHistory() {
      // Only fetch history if we have a session selected
      if (!this.appStore.sessionId) {
        return;
      }
      
      try {
        await this.appStore.fetchChatHistory();
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    },
    clearHistory() {
      this.appStore.clearChatHistory();
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    },
    resetState() {
      this.appStore.clearChatHistory();
    },
    openDialog(type, index) {
      this.activeItemType = type;
      this.activeItemIndex = index;
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
  },

  beforeRouteLeave(to, from, next) {
    // Clear current conversation but keep session
    this.appStore.rag_conversation = {};
    next();
  },
  created() {
    this.appStore = useAppStore();
    this.authStore = useAuthStore();
    // Only load history if there's an active session
    if (this.appStore.sessionId) {
      this.loadHistory();
    }
  },
  computed: {
    chatHistory() {
      return this.appStore.chatHistory || [];
    },
    // Chat history without the latest Q&A pair (to avoid duplication with rag_conversation)
    chatHistoryWithoutLatest() {
      const history = this.chatHistory;
      // Only filter if we have a current question AND answer being shown from rag_conversation
      // This means we just sent a message and got a response
      if (this.rag_conversation?.question && this.rag_conversation?.answer && history.length >= 2) {
        const lastUserMsg = history[history.length - 2];
        const lastAssistantMsg = history[history.length - 1];
        
        // Check if the last messages match the current conversation
        if (lastUserMsg?.message_type === 'user' && 
            lastUserMsg?.content === this.rag_conversation.question &&
            lastAssistantMsg?.message_type === 'assistant' &&
            lastAssistantMsg?.content === this.rag_conversation.answer) {
          return history.slice(0, -2);
        }
      }
      return history;
    },
    activeItem() {
      if (this.activeItemIndex !== null && this.activeItemType) {
        if (this.activeItemType === 'vector') {
          return this.vectorChunks[this.activeItemIndex];
        } else if (this.activeItemType === 'graph') {
          return this.graphChunks[this.activeItemIndex];
        }
      }
      return null;
    },
    vectorChunks() {
      const chunks = this.rag_conversation?.docs_expanded?.vector_chunks || [];
      return chunks.filter((item, idx) => {
        if (!item.page_content || item.page_content.length < 100) {
          console.log(`Vector chunk at index ${idx} hidden due to short excerpt.`);
          return false;
        }
        return true;
      });
    },
    graphChunks() {
      const chunks = this.rag_conversation?.docs_expanded?.graph_chunks || [];
      return chunks.filter((item, idx) => {
        if (!item.page_content || item.page_content.length < 100) {
          console.log(`Graph chunk at index ${idx} hidden due to short excerpt.`);
          return false;
        }
        return true;
      });
    },
    rag_conversation() {
      if (this.appStore) {
        return this.appStore.rag_conversation;
      }
      return {};
    },
    user_initials() {
      try {
        const user = this.authStore.userData;

        if (
          typeof user.first_name !== "string" ||
          typeof user.last_name !== "string"
        ) {
          throw new Error("Invalid name");
        }

        let first_name_letter = user.first_name.charAt(0);
        let last_name_letter = user.last_name.charAt(0);

        if (!first_name_letter || !last_name_letter) {
          throw new Error("Missing initials");
        }

        return first_name_letter + last_name_letter;
      } catch (error) {
        return "US";
      }
    },
  },
};
</script>
<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px); /* Account for AppBar height */
  background-color: #f8f9fa;
}

/* Messages Area - takes available space, pushes input to bottom */
.messages-area {
  flex: 1;
  padding: 2rem 1rem;
  padding-bottom: 140px; /* Space for fixed input */
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

/* Message Styles */
.message-wrapper {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-row {
  display: flex;
  width: 100%;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message-container {
  display: flex;
  gap: 12px;
  max-width: 85%;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-author {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.message-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

/* Loading Dots */
.loading-dots {
  display: flex;
  gap: 6px;
  padding: 1rem 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #9ca3af;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* References Section */
.references-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.references-title {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.reference-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reference-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.reference-chip:hover {
  background-color: #f3f4f6;
  transform: translateY(-1px);
}

/* Fixed Input Area at Bottom */
.input-area {
  position: fixed;
  bottom: 0;
  left: 256px; /* Account for NavDrawer width */
  right: 0;
  background-color: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  z-index: 100;
}

.input-container {
  max-width: 900px;
  margin: 0 auto;
}

.chat-input {
  background-color: white;
}

.chat-input :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.input-footer {
  text-align: center;
  margin-top: 0.5rem;
}

/* Dialog Styles */
.metadata-grid {
  display: grid;
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
}

.metadata-value {
  font-size: 0.9375rem;
  color: #1f2937;
}

.text-excerpt {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

/* Responsive - when drawer is collapsed or on mobile */
@media (max-width: 1264px) {
  .input-area {
    left: 0;
  }
}
</style>
