import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAQ_PATH = path.join(__dirname, "..", "data", "FAQs_Parachute_SA_Guatemala_2026.txt");
const EXIT_WORD = "bye";

function loadFaqContent() {
  if (!fs.existsSync(FAQ_PATH)) {
    console.error(`No se encontró el archivo de FAQs en: ${FAQ_PATH}`);
    process.exit(1);
  }
  return fs.readFileSync(FAQ_PATH, "utf-8");
}

function buildSystemPrompt(faqContent) {
  return [
    "Eres el agente virtual de preguntas frecuentes de Parachute S.A., una empresa de Guatemala",
    "que organiza un evento de paracaidismo.",
    "",
    "REGLAS ESTRICTAS:",
    "1. Responde ÚNICAMENTE con información contenida en el documento de FAQs que se te entrega abajo.",
    "2. Si la respuesta a la pregunta del usuario NO está en el documento, dilo explícitamente",
    '   (por ejemplo: "No tengo esa información en las FAQs del evento, te recomiendo contactar',
    '   directamente a Parachute S.A.") y NO inventes ni infieras datos que no estén en el texto.',
    "3. No respondas preguntas fuera del contexto del evento y sus FAQs, aunque creas saber la respuesta.",
    "4. Responde siempre en español, de forma breve, clara y amigable.",
    "",
    "=== DOCUMENTO DE FAQs (única fuente de verdad) ===",
    faqContent,
    "=== FIN DEL DOCUMENTO DE FAQs ===",
  ].join("\n");
}

function createClient() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error(
      "Falta la variable de entorno NVIDIA_API_KEY.\n" +
        "1) Copia .env.example a .env\n" +
        "2) Coloca tu API key de https://build.nvidia.com\n" +
        "3) Vuelve a ejecutar: npm start"
    );
    process.exit(1);
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
}

async function askAgent(client, model, messages) {
  const stream = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.2,
    stream: true,
  });

  let fullResponse = "";
  process.stdout.write("Agente: ");
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content ?? "";
    if (delta) {
      process.stdout.write(delta);
      fullResponse += delta;
    }
  }
  process.stdout.write("\n\n");
  return fullResponse;
}

async function main() {
  const faqContent = loadFaqContent();
  const model = process.env.NVIDIA_MODEL || "meta/llama-3.2-11b-vision-instruct";
  const client = createClient();

  const messages = [{ role: "system", content: buildSystemPrompt(faqContent) }];

  console.log("=================================================================");
  console.log(" Agente de FAQs - Parachute S.A. (Evento de Paracaidismo 2026)");
  console.log("=================================================================");
  console.log('Escribe tu pregunta y presiona Enter. Escribe "Bye" o Ctrl-C para salir.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let closed = false;

  rl.on("close", () => {
    closed = true;
  });

  rl.on("SIGINT", () => {
    console.log("\n\nAgente: ¡Hasta luego! Gracias por tu interés en el evento de Parachute S.A.");
    rl.close();
    process.exit(0);
  });

  const ask = () => rl.question("Tú: ", async (userInput) => {
    const trimmed = userInput.trim();

    if (trimmed.length === 0) {
      return ask();
    }

    if (trimmed.toLowerCase() === EXIT_WORD) {
      console.log("\nAgente: ¡Hasta luego! Gracias por tu interés en el evento de Parachute S.A.");
      rl.close();
      return;
    }

    messages.push({ role: "user", content: trimmed });

    try {
      const answer = await askAgent(client, model, messages);
      messages.push({ role: "assistant", content: answer });
    } catch (err) {
      console.error("\nOcurrió un error al consultar el modelo:", err.message ?? err);
      console.log();
      messages.pop();
    }

    if (!closed) ask();
  });

  ask();
}

main();
