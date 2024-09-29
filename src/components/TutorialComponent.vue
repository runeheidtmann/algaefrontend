<template>
  <v-container>
    <v-row justify="center" class="w-75">
      <v-col cols="12">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="8">
              <h1 class="text-left">
                How to Ask Effective Questions in Algaebrain
              </h1>
              <p class="text-left subtitle-1 mb-5">
                Enhance your inquiries to get precise and useful answers from
                the domain-specific chatbot Algaebrain.
              </p>
              <p class="text-left text-body-1 mb-10">
                Algaebrain is a domain-specific chatbot focused on algae
                research. When you interact with the system how you frame your
                questions can greatly affect the quality and relevance of the
                responses you receive. <br />Here are three examples of both
                effective and ineffective ways to frame your questions within
                this domain:
              </p>

              <v-card class="mb-8 bg-grey-lighten-3 pt-5 pb-5">
                <v-card-title class="text-h6"
                  >Example 1: Asking About Algae Growth Conditions</v-card-title
                >
                <v-card-text>
                  <p class="mb-3">
                    <strong class="text-success">Good:</strong> "What are the
                    optimal light and temperature conditions for the growth of
                    Spirulina algae?"
                  </p>
                  <p class="mb-3">
                    <strong class="text-error">Bad:</strong> "How do you grow
                    algae?"
                  </p>
                  <p class="mb-3">
                    This question is specific and clear, making it easier for
                    the chatbot to provide accurate information on Spirulina
                    algae growth conditions.
                  </p>
                </v-card-text>
              </v-card>

              <v-card class="mb-8 bg-grey-lighten-3 pt-5 pb-5">
                <v-card-title
                  >Example 2: Inquiring About Algal Biofuels</v-card-title
                >
                <v-card-text>
                  <p class="mb-3">
                    <strong class="text-success">Good:</strong> "Can you explain
                    the process of converting Chlorella algae into biofuel, and
                    what are the efficiency rates?"
                  </p>
                  <p class="mb-3">
                    <strong class="text-error">Bad:</strong> "Do algae make good
                    biofuel?"
                  </p>
                  <p class="mb-3">
                    By specifying the algae species and asking about the
                    conversion process, the question encourages a detailed and
                    useful response.
                  </p>
                </v-card-text>
              </v-card>

              <v-card class="mb-8 bg-grey-lighten-3 pt-5 pb-5">
                <v-card-title>Example 3: Researching Algal Blooms</v-card-title>
                <v-card-text>
                  <p class="mb-3">
                    <strong class="text-success">Good:</strong> "What are the
                    leading causes of harmful algal blooms in freshwater
                    ecosystems, and how can they be mitigated?"
                  </p>
                  <p class="mb-3">
                    <strong class="text-error">Bad:</strong> "Why do algae
                    bloom?"
                  </p>
                  <p class="mb-3">
                    A focused question on harmful algal blooms prompts the
                    chatbot to provide specific causes and mitigation
                    strategies.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            text="
The data used to develop the Algaebrain is entirely sourced from publicly available and open-access materials, such as academic research papers, books, and Wikipedia articles. This aligns with the principles of transparency and accessibility, ensuring that the knowledge base can be freely used and expanded.
While the system strives to provide accurate and contextually relevant information, it relies on probabilistic language models that can sometimes generate incorrect or incomplete responses. We adhere to the ethical principles outlined by the Association for Computational Linguistics ethics policy, including honesty, fairness, and responsibility in data usage. We encourage users to critically evaluate the system’s outputs and recognize that the chatbot’s responses are not guaranteed to be fully accurate.
"
            title="Ethics statement"
            type="info"
          ></v-alert>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "TutorialPage",
};
</script>

<style scoped>
.subtitle-1 {
  color: #757575;
}
</style>
