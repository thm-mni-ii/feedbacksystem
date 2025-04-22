<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-tabs class="d-flex justify-between">
        <v-tab @click="router.push('/')">Home</v-tab>
        <v-tab v-if="decodedToken.globalRole == 'ADMIN'" @click="router.push('/allQuestions')"
          >All Questions</v-tab
        >
        <v-tab v-if="decodedToken.globalRole != 'ADMIN'" @click="router.push('/CourseOverview')"
          >Edit Catalog</v-tab
        >
      </v-tabs>
    </v-app-bar>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

const decodedToken = ref<{}>()

const decodeJwtToken = () => {
  const token = localStorage.getItem('jsessionid')
  const decoded = jwtDecode<JwtPayload>(token)
  return decoded
}
onMounted(() => {
  decodedToken.value = decodeJwtToken()
})

const router = useRouter()
</script>

<style scoped lang="scss"></style>
