import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com"
});

async function test() {
  const models = ["gpt-4-turbo", "o1-mini", "Meta-Llama-3.1-405B-Instruct", "Mistral-large-2407", "Cohere-command-r-plus"];
  const longText = "hello ".repeat(8000); // 8000 words, ~10000 tokens
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      await client.chat.completions.create({
        messages: [{ role: "user", content: longText }],
        model: model,
        max_tokens: 4000
      });
      console.log(`${model} succeeded!`);
    } catch (e: any) {
      console.error(`${model} failed: ${e.message}`);
    }
  }
}

test();
