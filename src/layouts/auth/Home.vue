<template>
  <v-app>
    <v-main class="bgcol-div">
      <section id="hero">
        <v-sheet
          class="d-flex align-center mx-auto pb-16 bgcol-div text-col-purple"
        >
          <v-container class="text-center p-48">
            <v-responsive class="mx-auto align-center" width="800" height="700">
              <v-img
                :width="800"
                cover
                src="/algae2.jpg"
                class="mb-5"
              ></v-img>
              <h2 class="text-h2 text-col-purple">Try chatting with your research</h2>

              <p class="mt-3 text-h6 text-col-purple">
                This is a domain specific chatbot. It was created for
                Algae researchers to be able to find relevant answers to their
                everyday questions much quicker.
              </p>
            </v-responsive>
          </v-container>
        </v-sheet>
      </section>

      <!-- Footer Section -->
      <v-sheet class="py-16 bgcolor-green">
        <v-container>
          <v-row class="mb-8">
            <!-- Left Column - Logo and Info -->
            <v-col cols="12" md="4">
              <div class="mb-4">
                <a href="https://algaeprobanos.eu/" target="_blank">
                  <v-img
                    src="https://algaeprobanos.eu/wp-content/uploads/2023/09/APB-logo-white.png"
                    alt="AlgaePro Banos"
                    max-width="200"
                    class="mb-4"
                  />
                </a>
              </div>
              <div class="mb-4">
                <v-img
                  src="https://algaeprobanos.eu/wp-content/uploads/2023/09/EN_Co-fundedbytheEU_RGB_NEG.png"
                  alt="Co-funded by the EU"
                  max-width="150"
                />
              </div>
              <p class="text-white">
                Accelerating algae product development in the Baltic and North Sea
              </p>
            </v-col>

            <!-- Middle Column - Organisation Links -->
            <v-col cols="12" md="2">
              <h3 class="text-h6 text-white mb-3">Organisation</h3>
              <div class="footer-links">
                <a href="https://algaeprobanos.eu/about-us/" target="_blank" class="footer-link">About us</a>
                <a href="https://algaeprobanos.eu/project-partners/" target="_blank" class="footer-link">Project partners</a>
                <a href="https://algaeprobanos.eu/news/" target="_blank" class="footer-link">News and events</a>
                <a href="https://algaeprobanos.eu/contact/" target="_blank" class="footer-link">Contact</a>
              </div>
            </v-col>

            <!-- Product Links -->
            <v-col cols="12" md="2">
              <h3 class="text-h6 text-white mb-3">Product</h3>
              <div class="footer-links">
                <a href="https://algaeprobanos.eu/pilots-and-products/" target="_blank" class="footer-link">Pilots and products</a>
                <a href="https://algaeprobanos.eu/training-platform/" target="_blank" class="footer-link">Training platform</a>
                <a href="https://algaeprobanos.eu/deliverables/" target="_blank" class="footer-link">Deliverables</a>
              </div>
            </v-col>

            <!-- Newsletter Signup -->
            <v-col cols="12" md="4">
              <v-btn
                color="white"
                variant="outlined"
                href="#newsletter"
                target="_blank"
                class="mb-4"
              >
                Sign up for our newsletter
              </v-btn>
            </v-col>
          </v-row>

          <!-- Footer Info -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-divider color="white" class="mb-4"></v-divider>
              <p class="text-white text-body-2">
                This project has received funding from the European Union's Horizon Europe programme under grant agreement no. 101112943. 
                Information and views set out across this website are those of the author(s) and do not necessarily reflect the official opinion or position of the European Union.
                Neither European Union institutions and bodies nor any person acting on their behalf may be held responsible for the use that may be made of the information contained herein.
              </p>
            </v-col>
          </v-row>

          <!-- Bottom Footer -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="footer-links">
                <a href="https://algaeprobanos.eu/privacy-notice/" target="_blank" class="footer-link me-4">Privacy Notice</a>
                <a href="https://algaeprobanos.eu/imprint/" target="_blank" class="footer-link">Imprint</a>
              </div>
            </v-col>
            <v-col cols="12" md="6" class="text-md-end">
              <div class="d-flex justify-md-end align-center">
                <a href="https://twitter.com/algaeprobanos" target="_blank" class="social-icon me-3">
                  <v-icon color="white">mdi-twitter</v-icon>
                </a>
                <a href="https://www.linkedin.com/company/algaeprobanos/" target="_blank" class="social-icon me-4">
                  <v-icon color="white">mdi-linkedin</v-icon>
                </a>
                <span class="text-white text-body-2">© 2024 copyright AlgaeProBANOS. All Rights Reserved.</span>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from "pinia";
import { useAuthStore } from "@/store/authStore";

export default {
  data: () => ({
    overlayLogin: false,
    overlaySignin: false,
    username: null,
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
  methods: {
    onSubmit() {
      if (!this.form) return;

      this.loading = true;

      setTimeout(() => (this.loading = false), 2000);
    },
    required(v) {
      return !!v || "Field is required";
    },
    async handleLogin() {
      const authStore = useAuthStore();
      try {
        await authStore.login(this.username, this.password);
        this.$router.push({ name: "Home" });
      } catch (error) {
        this.errorMessage = "Failed to login. Please check your credentials.";
      }
    },
  },
  computed: {
    // a computed getter
    ...mapState(useAuthStore, ["isLoggedIn"]),
  },
};
</script>
<style scoped>
.bgcol-div {
  background-color: #F2F3EA !important 
}
.text-col-purple{
  color: #781847
}
.bgcolor-green{
 background-color: #2A4200 !important
}
.social-icon {
  font-size: 21px;
  color: white;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.footer-link:hover {
  color: #F2F3EA;
  text-decoration: underline;
}
</style>
