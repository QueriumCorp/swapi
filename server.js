"use strict";

// Read the .env file.
import 'dotenv/config'

// Require the framework
import Fastify from "fastify";

// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from "close-with-grace";

// Instantiate Fastify with some config
const app = Fastify({
  // disableRequestLogging: true,
  logger: {
    level: 'info',
    file: process.env.SWAPI_LOGFILE || '/home/ubuntu/.pm2/logs/swapi_log.json'
  },
});

// Register your application as a normal plugin.
import appService from "./app.js";
app.register(appService);

// delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: 500 }, async function ({
  signal,
  err,
  manual
}) {
  if (err) {
    app.log.error(err);
  }
  await app.close();
});

app.addHook("onClose", async (instance, done) => {
  closeListeners.uninstall();
  done();
});


// accept requests from anywhere.
const HOST = '0.0.0.0';
const PORT = process.env.SWAPI_PORT || 3000;
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

