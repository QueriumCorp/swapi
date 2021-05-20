'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    let rightNow = new Date();
    return { 
      alive: true,
      serverTime: ("0" + rightNow.getHours()).slice(-2) + ':' + 
                  ("0" + rightNow.getMinutes()).slice(-2) + ':' + 
                  ("0" + rightNow.getSeconds()).slice(-2) 
    }
  })
}
