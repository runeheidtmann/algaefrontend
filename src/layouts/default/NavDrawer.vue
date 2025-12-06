<template>
  <v-navigation-drawer
    permanent
    floating
    border="false"
    class="bgcolor-green"
  >
    <template v-slot:append>
      <div class="pa-4">
        <div class="mb-4">
          <v-img
            src="https://algaeprobanos.eu/wp-content/uploads/2023/09/EN_Co-fundedbytheEU_RGB_NEG.png"
            alt="Co-funded by the EU"
            max-width="150"
          />
        </div>
        <v-divider color="white" class="mb-3"></v-divider>
        <p class="text-white text-caption">
          Accelerating algae product development in the Baltic and North Sea
        </p>
      </div>
    </template>

    <!-- Chat List fills available space -->
    <div class="nav-drawer-content">
      <ChatListComponent />
    </div>
  </v-navigation-drawer>
</template>
<script>
import { useAuthStore } from "@/store/authStore";
import ChatListComponent from "@/components/ChatListComponent.vue";

export default {
  components: {
    ChatListComponent,
  },
  data: () => ({
    username: "",
    first_name: null,
    last_name: null,
    email: null,
    form: false,
    password: null,
    loading: false,
    title: "Endorfine",
    imageLink: {
      main: "https://firebasestorage.googleapis.com/v0/b/endorfinevue.appspot.com/o/assets%2Fb13f0434-b228-11e6-8e5d-5252025056ab_web_scale_0.4666667_0.4666667__.jpg?alt=media&token=660df23e-599e-434b-9313-ba69c973eeea",
      sub_main:
        "https://firebasestorage.googleapis.com/v0/b/endorfinevue.appspot.com/o/assets%2FNight-Club-Clubbing-Jobs-Abroad2.jpg?alt=media&token=82bbda7d-5df4-430b-9217-adaf1c8485c5",
      logo: "https://firebasestorage.googleapis.com/v0/b/endorfinevue.appspot.com/o/assets%2Fandroid-chrome-512x512.png?alt=media&token=8a0a66f6-4741-4ff6-8f28-eb9ec74374df",
      social_cover:
        "https://firebasestorage.googleapis.com/v0/b/endorfinevue.appspot.com/o/assets%2Fo-NIGHTCLUB-facebook.jpg?alt=media&token=cefc5c4c-9714-41da-9c22-f63caf5e89a4",
    },
    emailRules: [
      (v) => {
        return !!v || "E-mail is required";
      },
      (v) =>
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
        "E-mail must be valid",
    ],
    subscribed: false,
  }),
  methods: {},
  computed: {
    userData() {
      const authStore = useAuthStore();
      return authStore.userData;
    },
  },
  mounted() {
    const authStore = useAuthStore();
    authStore.fetchUserData();
  },
};
</script>
<style scoped>
.routerlink {
  text-decoration: none;
  color: white !important;
}
.bgcolor-green {
  background-color: #2A4200 !important;
}

.nav-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Make all navigation drawer content white */
.v-navigation-drawer {
  color: white !important;
}

/* Make list items and icons white */
.v-list-item {
  color: white !important;
}

.v-list-item .v-icon {
  color: white !important;
}

/* Make user info white */
.v-list-item[subtitle] {
  color: white !important;
}
</style>
