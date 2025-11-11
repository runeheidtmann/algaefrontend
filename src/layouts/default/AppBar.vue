<template>
  <v-app-bar flat class="bgcol">
    <v-app-bar-title class="text-white">
      <img src="@/assets/APB-logo-white.png" alt="AlgaeBrain Logo" style="height: 32px; margin-right: 8px;" />

      Algae Knowledge Database Chat
      
  
    </v-app-bar-title>
          <template v-slot:append>
            <div v-if="authStore.isLoggedIn">
            <v-btn class="logout-btn" color="white" @click="handleLogout">Logout</v-btn>
            </div>
      </template>

  </v-app-bar>
</template>

<script >
import { useAuthStore } from '@/store/authStore'; // Adjust the path as needed

export default {
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  methods: {
  async handleLogout() {
    await this.authStore.logout();
    this.$router.push({ name: 'PublicHome' });
  }
}
};
</script>

<style scoped>
.bgcol{
  background-color: #5F7A2F !important;
}
.text-col-purple{
  color: #781847
}

/* Logout button styling to match signup button */
.logout-btn {
  background-color: #781847 !important;
  color: white !important;
}
</style>
