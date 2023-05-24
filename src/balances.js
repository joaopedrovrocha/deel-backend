const { Router } = require("express");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");

const balances = Router()

balances.post('/deposit/:userId', getProfile, async (req, res) => {
    const { Contract, Job, Profile } = req.app.get('models')
    const { userId } = req.params

    const client = await Profile.findByPk(userId)

    if (!client) {
        return res.status(404)
    }

    const jobs = await Job.findAll({
        where: {
            [Op.or]: [
                { paid: null },
                { paid: false }
            ],
        },
        include: [{
            model: Contract,
            where: { ClientId: userId }
        }]
    })

    const totalUnpaidJobs = jobs.reduce((prev, current) => prev + current.price, 0)
    const max = totalUnpaidJobs * 0.25

    await client.update({ balance: (client.balance + max) })

    res.json(client)
})

module.exports = { balances }