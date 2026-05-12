<template>
  <div class="mt-8">
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-card-text class="text-center text-h6 text-md-h5 text-lg-h5 mb-8">
        Forgot your password?
      </v-card-text>

      <v-card-text class="text-center text-body-2 mb-4">
        Enter your email address and we'll send you a link to reset your password.
      </v-card-text>

      <v-alert v-if="successMessage" color="success" :text="successMessage" class="mb-5"></v-alert>
      <v-alert v-if="errorMessage" color="error" :text="errorMessage" class="mb-5"></v-alert>

      <div class="text-subtitle-1 text-medium-emphasis">Email</div>

      <v-text-field
        v-model="email"
        :disabled="loading || !!successMessage"
        density="compact"
        placeholder="Enter your email"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        type="email"
        @keyup.enter="handleSubmit"
      ></v-text-field>

      <v-btn
        @click="handleSubmit"
        :loading="loading"
        :disabled="loading || !!successMessage"
        block
        class="mt-8 mb-8 text-col-purple"
        size="large"
        variant="tonal"
      >
        Send Reset Link
      </v-btn>

      <v-card-text class="text-center">
        <router-link to="/login" class="text-col-purple" style="text-decoration: none">
          <v-icon icon="mdi-chevron-left"></v-icon> Back to Login
        </router-link>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    email: "",
    loading: false,
    successMessage: "",
    errorMessage: "",
  }),
  methods: {
    async handleSubmit() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.email) {
        this.errorMessage = "Please enter your email address.";
        return;
      }

      if (!this.isValidEmail(this.email)) {
        this.errorMessage = "Please enter a valid email address.";
        return;
      }

      this.loading = true;

      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/password-reset/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: this.email }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Failed to send reset email.");
        }

        this.successMessage = "Check your email for a reset link.";
      } catch (error) {
        this.errorMessage = error.message || "An error occurred. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    isValidEmail(email) {
      return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
  },
};
</script>

<style scoped>
.text-col-purple {
  color: #781847;
}
</style>
