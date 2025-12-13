#!/usr/bin/env node
/**
 * Quick test for DeepSeek integration
 * Run: node scripts/deepseek-test.mjs
 */

import { deepseekSimpleChat, deepseekGenerateCode } from "../lib/deepseek-client.ts";

async function main() {
  console.log("🚀 DeepSeek Integration Test\n");

  // Test 1: Simple chat
  console.log("--- Test 1: Simple Chat ---");
  try {
    const response = await deepseekSimpleChat(
      "Say hello in one sentence, briefly."
    );
    console.log("✓ Chat response:", response);
  } catch (err) {
    console.error("✗ Chat failed:", err instanceof Error ? err.message : err);
  }

  console.log("\n--- Test 2: Code Generation ---");
  try {
    const code = await deepseekGenerateCode(
      "Write a TypeScript function that adds two numbers",
      "typescript"
    );
    console.log("✓ Generated code:\n", code);
  } catch (err) {
    console.error("✗ Code gen failed:", err instanceof Error ? err.message : err);
  }

  console.log("\n✓ Tests completed");
}

main().catch(console.error);
