import React from "react";
import { render } from "ink";
import { App } from "./tui/app.js";

async function main() {
  const { waitUntilExit } = render(<App />);

  await waitUntilExit();
  console.log("Bye!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
