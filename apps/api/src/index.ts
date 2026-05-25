import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      const c = {
        reset: "\x1b[0m",
        bold: "\x1b[1m",
        red: "\x1b[1;31m",
        yellow: "\x1b[1;33m",
        blue: "\x1b[1;34m",
        cyan: "\x1b[1;36m",
        green: "\x1b[0;32m",
        gray: "\x1b[0;90m",
      };
      const line = `${c.yellow}${"═".repeat(46)}${c.reset}`;
      console.log(`\n${line}`);
      console.log(`${c.yellow}║${c.reset}  ${c.red}${c.bold}🍵  C H A I F O R M S${c.reset}                     ${c.yellow}║${c.reset}`);
      console.log(`${c.yellow}║${c.reset}  ${c.gray}Dexter's Forms Lab — API Server${c.reset}          ${c.yellow}║${c.reset}`);
      console.log(`${line}`);
      console.log(`${c.yellow}║${c.reset}  ${c.green}✓${c.reset} API       ${c.cyan}http://localhost:${PORT}${c.reset}        ${c.yellow}║${c.reset}`);
      console.log(`${c.yellow}║${c.reset}  ${c.green}✓${c.reset} Docs      ${c.cyan}http://localhost:${PORT}/docs${c.reset}   ${c.yellow}║${c.reset}`);
      console.log(`${c.yellow}║${c.reset}  ${c.green}✓${c.reset} Env       ${c.blue}${env.NODE_ENV}${c.reset}${" ".repeat(34 - env.NODE_ENV.length)}${c.yellow}║${c.reset}`);
      console.log(`${line}\n`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
