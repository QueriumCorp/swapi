'use strict'

require("dotenv").config();

const pickAiServer = () => {
  const aiServerData = JSON.parse(process.env.AISERVERS);

  // Randomly pick an Ai servere from available servers in the env
  // NOTE: the value (integer) of the "power" field indicates the capability of
  // the server. Probability of getting selected increases with the higher
  // power value. An Ai server with power 2 is twice as likely to be picked as
  // an Ai server with power 1.
  let indices = aiServerData
    .map((i, idx) => {
      // If the power field is not defined, assign 1 power
      if (!("power" in i)) {
        return [idx];
      }

      // If the value of the power is a string
      let powerVal = i.power;
      if (typeof i.power === "string") {
        powerVal = parseInt(i.power);
      }

      return Array(powerVal).fill(idx);
    })
    .flat();
  // console.log(indices)
  const idxServer = Math.floor(Math.random() * indices.length);

  // Select an AI server based on the randomly selected index
  const pickedServer = aiServerData[indices[idxServer]];

  return { name: pickedServer.name, url: pickedServer.url };
};

// console.log(aiServer);
console.log("TESTING");
console.log(process.env.AISERVERS);
for (let i = 0; i < 500; i++) {
  const aiServer = pickAiServer();
  if (aiServer.name !== "ai04") {
    console.log("Error: " + aiServer.name);
  }
}
