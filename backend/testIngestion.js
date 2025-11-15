import fs from "fs/promises";
import path from "path";
import { DocumentIngestionAgent } from "./agents/DocumentIngestionAgent.js";

async function test() {
  const agent = new DocumentIngestionAgent();
  const filePath = path.resolve("./sample.pdf"); // adjust path
  const fileBuffer = await fs.readFile(filePath);

  const result = await agent.run({
    userId: "testuser123",
    filename: "sample.pdf",
    fileBuffer,
  });

  console.log("Ingestion result:", result);
}

test().catch(console.error);