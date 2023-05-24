const { Router } = require("express");
const { getProfile } = require("./middleware/getProfile");
const { Op, Sequelize } = require("sequelize");

const jobs = Router()

jobs.get('/unpaid', getProfile, async (req, res) => {
    const { Job, Contract } = req.app.get('models')
    const profile = req.profile

    const jobs = await Job.findAll({
        where: { [Op.or]: [{ paid: null }, { paid: false }] },
        include: [
            {
                model: Contract, where: {
                    [Op.or]: [{ ContractorId: profile.id }, { ClientId: profile.id }],
                    status: 'in_progress'
                }, attributes: []
            }
        ]
    })

    res.json(jobs)
})

jobs.post('/:jobId/pay', getProfile, async (req, res) => {
    const { Job, Profile, Contract } = req.app.get('models')
    const { jobId } = req.params
    const profile = req.profile

    const job = await Job.findByPk(jobId)

    if (!job) return res.status(404)

    const client = await Profile.findByPk(profile.id)
    const contract = await Contract.findByPk(job.ContractId)

    if (contract.ClientId !== client.id) {
        return res.status(400).json({ success: false, error: 'the client does not belongs to the contract' })
    }

    if (job.price > client.balance) {
        return res.status(400).json({ success: false, error: 'the client has no balance to pay for the job' })
    }

    const contractor = await Profile.findByPk(contract.ContractorId)

    // update the job
    await job.update({ paid: true, paymentDate: new Date() })
    // update the client
    await client.update({ balance: (client.balance - job.price) })
    // update the contractor
    await contractor.update({ balance: (contractor.balance + job.price) })

    res.json({ job, client, contractor })
})

module.exports = { jobs }