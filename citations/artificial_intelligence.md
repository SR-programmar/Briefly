# Briefly, Artificial Intelligence Courtesy

Briefly uses Artificial Intelligence to summarize webpages.
Briefly can choose to use **Gemini, OpenAI, or Gemma**.
Briefly's AI Agent (Referred to as Rosie) also relies on Artificial Intelligence to analyze user prompts.

**We didn't use AI to write any of the code for us, we are simply making API calls to it.**

We were not responsible for creating any of the Artificial Intelligence we use. The models
we make calls to are from OpenAI and Google and may be accessed through certain services like the GitHub marketplace or through [Google AI Studio](https://aistudio.google.com/).

# OpenAI & Github

Briefly's [back-end server](https://github.com/SR-programmar/Briefly-back-end) makes API calls to OpenAI's GPT 4.0 through the GitHub Marketplace.
It is used for summarization and for the AI Agent (Rosie)
The link to this page is [here](https://github.com/marketplace/models/azure-openai/gpt-4o)

# Google

Our back-end server also has the option to make API calls to either Gemma or Gemini.
We created an API key at [Google AI Studio](https://aistudio.google.com/), allowing us to make API calls to their various models.

## Gemma

Our back-end server's AI Agent (Rosie) utilizes Gemma because it offers 14.4k free calls a day

## Gemini

Our back-end server's utilizes Gemini to make summarization because it can handle much more text compared to Gemma with free-tier offers.

# Conclusion

Our extension relies heavily on AI to assist the visually impaired. We didn't have the AI
write any code for us at all, we simply are making API calls to it.
