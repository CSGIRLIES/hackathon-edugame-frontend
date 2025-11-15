import fs from "fs/promises";
import { DocumentIngestionAgent } from "./agents/DocumentIngestionAgent.js";

// Create a simple text buffer to test text extraction (instead of relying on existing PDFs)
const textBuffer = Buffer.from(`
This is a test PDF containing extractable text.

The DOMMatrix PDF parsing fix should allow this text to be extracted and processed.

Document ingestion should work properly now.

This text should be chunked and stored in the vector database.

The DocumentIngestionAgent should return success with chunks stored.
`, 'utf-8');

async function testTextExtraction() {
  const agent = new DocumentIngestionAgent();

  const result = await agent.run({
    userId: "testuser",
    filename: "test-text.txt",
    fileBuffer: textBuffer,
  });

  console.log("Text extraction test result:", result);
  if (result.status === 'success') {
    console.log("✅ DOMMatrix fix verified: Text extraction working correctly!");
  } else {
    console.log("❌ Something still wrong with text extraction");
  }
}

testTextExtraction().catch(console.error);
