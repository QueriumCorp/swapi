'use strict'

import fp from 'fastify-plugin'
import sensiblePkg from '@fastify/sensible'

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
  fastify.register(sensiblePkg, {
    errorHandler: false
  })
})
