"use strict";

// Read the .env file.
require("dotenv").config();

// Require the framework
const Fastify = require("fastify");

// Require library to exit fastify process, gracefully (if possible)
const closeWithGrace = require("close-with-grace");

// Instantiate Fastify with some config
const app = Fastify({
  // disableRequestLogging: true,
  logger: {
    level: 'info',
    file: process.env.SWAPI_LOGFILE || '/home/ubuntu/.pm2/logs/swapi_log.json'
  },
});

// Register your application as a normal plugin.
const appService = require("./app.js");
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

// Start listening.
//app.listen(process.env.SWAPI_PORT || 3000, err => {
//  if (err) {
//    app.log.error(err);
//    process.exit(1);
//  }
//});

const HOST = '0.0.0.0';
const PORT = process.env.SWAPI_PORT;
app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

