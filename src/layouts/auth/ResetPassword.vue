<template>
  <div class="mt-8">
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-card-text class="text-center text-h6 text-md-h5 text-lg-h5 mb-8">
        Reset your password
      </v-card-text>

      <v-alert v-if="!token" color="error" text="Invalid or missing reset token. Please request a new reset link." class="mb-5"></v-alert>
      <v-alert v-if="successMessage" color="success" :text="successMessage" class="mb-5"></v-alert>
      <v-alert v-if="errorMessage" color="error" :text="errorMessage" class="mb-5"></v-alert>

      <template v-if="token && !successMessage">
        <div class="text-subtitle-1 text-medium-emphasis">New Password</div>

        <v-text-field
          v-model="password"
          :append-inner-icon="visiblePassword ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visiblePassword ? 'text' : 'password'"
          :disabled="loading"
          density="compact"
          placeholder="Enter new password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visiblePassword = !visiblePassword"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis">Confirm Password</div>

        <v-text-field
          v-model="confirmPassword"
          :append-inner-icon="visibleConfirm ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visibleConfirm ? 'text' : 'password'"
          :disabled="loading"
          density="compact"
          placeholder="Confirm new password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visibleConfirm = !visibleConfirm"
          @keyup.enter="handleSubmit"
        ></v-text-field>

        <v-btn
          @click="handleSubmit"
          :loading="loading"
          :disabled="loading"
          block
          class="mt-8 mb-8 text-col-purple"
          size="large"
          variant="tonal"
        >
          Reset Password
        </v-btn>
      </template>

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
    token: "",
    password: "",
    confirmPassword: "",
    visiblePassword: false,
    visibleConfirm: false,
    loading: false,
    successMessage: "",
    errorMessage: "",
  }),
  mounted() {
    // Read token from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    this.token = urlParams.get("token") || "";
  },
  methods: {
    async handleSubmit() {
      this.errorMessage = "";
      this.successMessage = "";

      if (!this.password) {
        this.errorMessage = "Please enter a new password.";
        return;
      }

      if (this.password.length < 8) {
        this.errorMessage = "Password must be at least 8 characters long.";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      this.loading = true;

      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${baseURL}/api/password-reset/confirm/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: this.token,
            password: this.password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Failed to reset password. The token may be expired or invalid.");
        }

        this.successMessage = "Password reset successfully! Redirecting to login...";
        
        setTimeout(() => {
          this.$router.push({ name: "Login" });
        }, 2000);
      } catch (error) {
        this.errorMessage = error.message || "An error occurred. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.text-col-purple {
  color: #781847;
}
</style>
