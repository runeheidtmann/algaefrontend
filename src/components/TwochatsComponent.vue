<template>
  <v-container fluid class="fill-height">
    <v-container class="w-85 fill-height">
      <!-- Adjusted main section content -->
      <!-- First row with 2 columns each containing a card -->
      <v-row class="h-80 w-100 justify-space-between">
        <v-col cols="12" class="d-flex flex-column">
          <div v-if="rag_conversation.question">
            <v-card
              class="flex-grow-1 rounded-card bg-grey-lighten-3 pa-7 ml-5"
            >
              <div class="d-flex w-100 mb-5 text-body-1">
                <div class="mr-5">{{ user_initials }}</div>
                <div>
                  <div class="font-weight-medium">You</div>
                  <div>
                    {{ rag_conversation.question }}
                  </div>
                </div>
              </div>
              <div
                v-if="rag_conversation.answer"
                class="d-flex w-100 mb-5 text-body-1"
              >
                <div class="mr-5">AB</div>
                <div>
                  <div class="font-weight-medium">AlgaeBrain</div>
                  <div class="mb-4" style="white-space: pre-line">
                    {{ rag_conversation.answer }}
                    <br />
                  </div>
                  <div>
                    <!-- Iterating over the array to create links -->
                    <p class="text-caption">References:</p>
                    <!-- Vector chunks -->
                    <div
                      v-for="(item, index) in vectorChunks"
                      :key="'vector-' + index"
                    >
                      <a
                        v-if="item.metadata.publication_date"
                        @click="openDialog('vector', index)"
                        class="text-primary text-caption"
                        style="cursor: pointer"
                      >
                        ({{ item.metadata.publication_date }})
                        {{ item.metadata.title.slice(0, 35) }}...
                      </a>
                    </div>
                    <!-- Graph chunks -->
                    <div
                      v-for="(item, index) in graphChunks"
                      :key="'graph-' + index"
                    >
                      <a
                        v-if="item.metadata && item.metadata.publication_date"
                        @click="openDialog('graph', index)"
                        class="text-primary text-caption"
                        style="cursor: pointer"
                      >
                        ({{ item.metadata.publication_date }})
                        {{ item.metadata.title.slice(0, 35) }}...
                      </a>
                    </div>

                    <!-- Dialog -->
                    <v-dialog v-model="dialog" width="800">
                      <v-card v-if="activeItem">
                        <v-card-title>
                          {{ activeItem.metadata.title }}
                        </v-card-title>
                        <v-card-text>
                          <b>Authors:</b><br />
                          {{ activeItem.metadata.authors }}
                        </v-card-text>
                        <v-card-text>
                          <b>Publication Date:</b><br />
                          {{ activeItem.metadata.publication_date }}
                        </v-card-text>
                        <v-card-text>
                          <b>File Name:</b><br />
                          {{ activeItem.metadata.file_name }}
                        </v-card-text>
                        <v-card-text>
                          <b>Page:</b><br />
                          {{ activeItem.metadata.page }}
                        </v-card-text>
                        <v-card-text>
                          <b>Text chunk:</b><br />
                          {{ activeItem.page_content }}
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text @click="closeDialog">Close Dialog</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </div>

                  <RatingComponent :LLM="2" />
                </div>
              </div>
              <div v-else>
                <v-progress-linear
                  indeterminate
                  color="yellow-darken-2"
                ></v-progress-linear>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <v-row class="h-20">
        <v-col cols="12" class="d-flex justify-center align-self-end">
          <v-textarea
            v-model="chatInput"
            @click:append-inner="sendQuery"
            v-on:keyup.enter="sendQuery"
            label="Message AlgaeBrain"
            append-inner-icon="mdi-chat"
            row-height="25"
            rows="2"
            variant="outlined"
            auto-grow
            shaped
          ></v-textarea>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
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
      const chatInputText = this.chatInput;
      this.loading = true;
      this.chatInput = "";
      try {
        await this.appStore.sendChatQuery(chatInputText);
      } catch (error) {
        this.errorMessage = "Some error in with the send question-thingy";
      }
      this.loading = false;
    },
    resetState() {
      this.appStore.resetConversation();
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
    this.resetState();
    next();
  },
  created() {
    this.appStore = useAppStore();
    this.authStore = useAuthStore();
  },
  computed: {
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
      return this.rag_conversation?.docs_expanded?.vector_chunks || [];
    },
    graphChunks() {
      return this.rag_conversation?.docs_expanded?.graph_chunks || [];
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
.h-80 {
  height: 80%;
}
.h-20 {
  height: 20%;
}
.w-85 {
  width: 85%;
}
.text-input {
  width: 75%;
}

.mr-space {
  margin-right: 20px;
}
.ml-space {
  margin-left: 20px;
}
</style>
