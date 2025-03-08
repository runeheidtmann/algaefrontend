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
                    <div
                      v-for="(item, index) in rag_conversation.docs.context"
                      :key="index"
                    >
                      <a
                        v-if="item[1][1].publication_date"
                        @click="openDialog(index)"
                        class="text-primary text-caption"
                        style="cursor: pointer"
                      >
                        ({{ item[1][1].publication_date }})
                        {{ item[1][1].title.slice(0, 35) }}...
                      </a>
                    </div>

                    <!-- Dialog -->
                    <v-dialog v-model="dialog" width="800">
                      <v-card v-if="activeItem">
                        <v-card-title>
                          {{ activeItem[1][1].title }}
                        </v-card-title>
                        <v-card-text>
                          <b>Authors:</b><br />
                          {{ activeItem[1][1].authors }}
                        </v-card-text>
                        <v-card-text>
                          <b>Text chunk:</b><br />
                          {{ activeItem[0][1] }}
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
    openDialog(index) {
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
      if (this.activeItemIndex !== null) {
        return this.rag_conversation.docs.context[this.activeItemIndex];
      }
      return null;
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
