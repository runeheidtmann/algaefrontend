<template>
  <v-container fluid class="fill-height">
    <v-container class="w-85 fill-height">
      <!-- Adjusted main section content -->
      <!-- First row with 2 columns each containing a card -->
      <v-row class="h-80 w-100 justify-space-between">
        <v-col cols="6" class="d-flex flex-column ">
          <div v-if="conversation.question">
            <v-card class="flex-grow-1 rounded-card bg-grey-lighten-3 pa-7 mr-5">
            <div class="d-flex w-100 mb-5 text-body-1">
              <div class="mr-5">RU</div>
              <div>
                <div class="font-weight-medium">You</div>
                <div>
                  {{ conversation.question }}
                </div>
              </div>
            </div>
            <div
              v-if="conversation.answer"
              class="d-flex w-100 mb-5 text-body-1"
            >
              <div class="mr-5">AB</div>
              <div>
                <div class="font-weight-medium">AlgaeBrain</div>
                <div>
                  {{ conversation.answer }}
                  <br />
                  
                </div>

                <RatingComponent />
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
        <v-col cols="6" class="d-flex flex-column">
          <div v-if="conversation.question">
            <v-card class="flex-grow-1 rounded-card bg-grey-lighten-3 pa-7 ml-5">
            <div class="d-flex w-100 mb-5 text-body-1">
              <div class="mr-5">RU</div>
              <div>
                <div class="font-weight-medium">You</div>
                <div>
                  {{ conversation.question }}
                </div>
              </div>
            </div>
            <div
              v-if="conversation.answer"
              class="d-flex w-100 mb-5 text-body-1"
            >
              <div class="mr-5">AB</div>
              <div>
                <div class="font-weight-medium">AlgaeBrain</div>
                <div>
                  {{ conversation.answer }}
                  <br />
                  <v-dialog width="800">
                    <template v-slot:activator="{ props }">
                      <a
                        v-bind="props"
                        text="[>_source]"
                        class="text-indigo-darken-4"
                      >
                      </a>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card :title="conversation.docs[0][1][1].source">
                        <v-card-text>
                          {{ conversation.docs[2][0][1] }}
                        </v-card-text>
                        <v-card-text>
                          <a href="#"
                            >{{ conversation.docs[2][1][1].source }}: page
                            {{ conversation.docs[0][1][1].page }}</a
                          >
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>

                          <v-btn
                            text="Close Dialog"
                            @click="isActive.value = false"
                          ></v-btn>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>

                <RatingComponent />
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

      <!-- Second row with a fixed height -->
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
import RatingComponent from "@/components/RatingComponent.vue";

export default {
  components: { RatingComponent },
  data() {
    return {
      loading: false,
      chatInput: "",
      appStore: null,
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
      this.appStore.resetConversation(); // Assuming this method resets your state
    },
  },

  beforeRouteLeave(to, from, next) {
    this.resetState(); // Call the reset state method
    next(); // Proceed with the route navigation
  },
  created() {
    this.appStore = useAppStore();
  },
  computed: {
    conversation() {
      if (this.appStore) {
        return this.appStore.conversation;
      }
      return {};
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
/* Custom margin classes */
.mr-space {
  margin-right: 20px; /* Adjust the space as needed */
}
.ml-space {
  margin-left: 20px; /* Adjust the space as needed */
}
</style>
