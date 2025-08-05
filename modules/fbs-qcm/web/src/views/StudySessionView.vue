<script setup lang="ts">

const startLearnSession = async () => {
  const courseId = ... // z. B. aus route.params
  try {
    const res = await sessionService.startLearnSession(courseId, ""); // Falls kein zusätzlicher Parameter notwendig ist oder anders übergeben
    sessionId.value = res.data.sessionId;
    // Lade die erste Frage
    await loadCurrentQuestion();
  } catch (error) {
    console.error("Error starting learn session:", error);
  }
}
</script>

<template>
  <v-card v-if="showErrorPage" class="h-52 mx-auto">
    <h2>Error: Could not find the page you're looking for</h2>
  </v-card>
  <v-form v-else class="mt-12">
    <v-sheet
      class="d-flex align-center justify-center flex-wrap flex-column text-center mx-auto my-14 px-4"
      elevation="4"
      height="auto"
      width="80%"
      rounded
    >
      <v-responsive class="mx-auto" width="85%">
        <h3 class="text-h3 my-8 font-weight-black text-blue-grey-darken-2">
          {{ catalog.name }}
        </h3>
        <div class="d-flex flex-row mb-8">
          <v-progress-linear
            min="0"
            :max="8"
            color="primary"
            height="8"
            :model-value="progressBar"
            stream
            rounded
          ></v-progress-linear>
        </div>
        <div v-if="catalogStatus == 'over' && !showFeedback">
          <h4 class="text-h4 my-8 font-weight-black text-blue-grey-darken-2">
            Finished!🎉 Here's your Summary:
          </h4>
          <SessionFeedback :questionReport="catalogEvaluation.questionReport" />
          <h3 class="text-blue-grey-darken-2">
            Total Score: {{ (catalogScore * 100).toFixed(2) }} %
          </h3>
          <v-btn
            variant="tonal"
            class="mx-auto my-8"
            type="button"
            append-icon="mdi-arrow-right-bold-outline"
            @click="router.push('/')"
          >
            Go back
          </v-btn>
        </div>
        <div v-if="showFeedback">
          <h4 class="text-h4 my-8 font-weight-black text-blue-grey-darken-2">You scored:</h4>
          <p class="text-blue-grey-darken-2">{{ formattedScore }} % {{ scoreEmoji }}</p>
          <v-btn
            variant="tonal"
            class="mx-auto my-8"
            type="button"
            append-icon="mdi-arrow-right-bold-outline"
            @click="showFeedback = false"
          >
            next
          </v-btn>
        </div>
        <CatalogSession
          v-if="questionData && catalogStatus == null && !showFeedback"
          :question="questionData"
          @submit-answer="submitAnswer"
        />
      </v-responsive>
    </v-sheet>
  </v-form>
</template>
