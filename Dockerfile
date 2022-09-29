# -----------------------------------------------------------------------------
# written by:      Lawrence McDaniel
#                  https://lawrencemcdaniel.com
#
# date:            sep-2022
#
# usage:           build SWAPI container
#
# see: https://medium.com/@pedro.schleder/use-docker-to-develop-a-node-js-app-part-1-b1b009008425
# -----------------------------------------------------------------------------

# We are using node's image as base for this one
FROM node:16

# Create the app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# create /home/ubuntu/.pm2/logs/swapi_log.json
# see: server.js in this repo
RUN mkdir /home/ubuntu \
 && mkdir /home/ubuntu/.pm2 \
 && mkdir /home/ubuntu/.pm2/logs \
 && touch /home/ubuntu/.pm2/logs/swapi_log.json \
 && chmod 644 /home/ubuntu/.pm2/logs/swapi_log.json

# Copy all other files
# MCDANIEL: 
# FIX NOTE: it would be advantageous to refactor the repo, moving
# the actual js source code into a folder named 'src' so that we're
# not copying all of the dev and ci files into the container.
COPY . .

# mcdaniel sep-2022: the Dockerfiles from tutor for e-commerce, mfe, lms
# all export port 8000. assuming that the k8s service will need to
# map some non-trivial service port number to this number 8000.
EXPOSE 8000

# Tell Docker to run server.js when the container is deployed to k8s
CMD [ "node", "server.js" ]