<template>
  <v-app-bar class="bgcol">
    <v-container class="d-flex align-center py-0">
      <v-app-bar-title class="pl-0">
        <div class="d-flex align-center">
          <router-link to="/public" class="none">
            <img src="@/assets/APB-logo-white.png" alt="AlgaeBrain Logo" style="height: 32px; margin-right: 8px;" />
          
          Algae Knowledge Database
          </router-link>
        </div>
      </v-app-bar-title>

      <v-spacer />

      <div>
        <router-link to="/login">
          <v-btn color="white"> Login </v-btn>
        </router-link>
      </div>
      <div>
        <router-link to="/signup" class="signup-link">
          <v-btn color="white"> Sign up </v-btn>
        </router-link>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
//
</script>
<style scoped>
/* unvisited link */
a:link {
  color: white;
  text-decoration: none;
}
.bgcol{
  background-color: #5F7A2F !important;
}
/* visited link */
a:visited {
  color: white;
}

/* mouse over link */
a:hover {
  color: white;
}

/* selected link */
a:active {
  color: white
}

/* Sign up link specific styling */
.signup-link .v-btn {
  background-color: #781847 !important;
  color: white !important;
}
</style>