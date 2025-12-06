<template>
  <div class="chat-list-wrapper">
    <div class="chat-list-header">
      <span class="text-caption text-white font-weight-medium">CHATS</span>
      <v-btn
        icon
        size="x-small"
        variant="text"
        @click="createNewChat"
        :loading="isCreating"
        :disabled="isWaitingForResponse"
        class="new-chat-btn"
      >
        <v-icon size="18">mdi-plus</v-icon>
      </v-btn>
    </div>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="white"
      height="2"
    ></v-progress-linear>

    <div class="chat-list-scrollable">
      <v-list density="compact" nav class="chat-sessions-list" bg-color="transparent">
      <v-list-item
        v-for="session in chatSessions"
        :key="session.id"
        :active="appStore.sessionId === session.id"
        @click="selectSession(session.id)"
        :disabled="isWaitingForResponse && appStore.sessionId !== session.id"
        class="chat-session-item"
      >
        <template v-slot:prepend>
          <v-icon size="18">mdi-chat-outline</v-icon>
        </template>
        <v-list-item-title class="text-truncate">
          {{ session.title || `Chat ${session.id}` }}
        </v-list-item-title>
        <template v-slot:append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="delete-btn"
            @click.stop="deleteSession(session.id)"
            :loading="deletingSessionId === session.id"
          >
            <v-icon size="16">mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

      <div v-if="!isLoading && chatSessions.length === 0" class="no-chats">
        <span class="text-caption text-white-darken-2">No saved chats</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "@/store/app";

export default {
  data() {
    return {
      appStore: null,
      isCreating: false,
      deletingSessionId: null,
    };
  },
  computed: {
    chatSessions() {
      return this.appStore?.chatSessions || [];
    },
    isLoading() {
      return this.appStore?.isLoadingSessions || false;
    },
    isWaitingForResponse() {
      // Check if a question was sent but answer hasn't come back yet
      const conv = this.appStore?.rag_conversation;
      return conv?.question && !conv?.answer;
    },
  },
  methods: {
    async selectSession(sessionId) {
      // Don't do anything if clicking on the already active session
      if (this.appStore.sessionId === sessionId) {
        return;
      }
      // Clear current conversation when switching sessions
      this.appStore.rag_conversation = {};
      this.appStore.sessionId = sessionId;
      await this.appStore.fetchChatHistory();
    },
    async createNewChat() {
      // Check if an empty session already exists (title is still 'New Chat')
      const emptySession = this.chatSessions.find(s => s.title === 'New Chat');
      if (emptySession) {
        // Select existing empty session instead of creating a new one
        await this.selectSession(emptySession.id);
        return;
      }

      this.isCreating = true;
      try {
        await this.appStore.createNewSession();
      } catch (error) {
        console.error('Error creating new chat:', error);
      } finally {
        this.isCreating = false;
      }
    },
    async deleteSession(sessionId) {
      this.deletingSessionId = sessionId;
      try {
        await this.appStore.deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting chat:', error);
      } finally {
        this.deletingSessionId = null;
      }
    },
  },
  async created() {
    this.appStore = useAppStore();
    await this.appStore.fetchChatSessions();
  },
};
</script>

<style scoped>
.chat-list-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  flex-shrink: 0;
}

.new-chat-btn {
  color: white !important;
}

.chat-list-scrollable {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.chat-sessions-list {
  padding: 0;
}

.chat-session-item {
  color: white !important;
  border-radius: 8px;
  margin: 2px 8px;
}

.chat-session-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.chat-session-item.v-list-item--active {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.chat-session-item .v-icon {
  color: white !important;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white !important;
}

.chat-session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ff6b6b !important;
}

.no-chats {
  padding: 8px 16px;
  text-align: center;
}

/* Scrollbar styling */
.chat-list-scrollable::-webkit-scrollbar {
  width: 4px;
}

.chat-list-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list-scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>
