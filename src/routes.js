const { Router } = require('express')
const { contracts } = require('./contracts')
const { jobs } = require('./jobs')
const { balances } = require('./balances')
const { admin } = require('./admin')

const routes = Router()

routes.use('/contracts', contracts)
routes.use('/jobs', jobs)
routes.use('/balances', balances)
routes.use('/admin', admin)

module.exports = { routes }