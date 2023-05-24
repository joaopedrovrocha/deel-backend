const { Router } = require("express");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");
const { sequelize } = require("./model");

const admin = Router()

admin.get('/best-profession', getProfile, async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    const { start, end } = req.query

    if (!start || !end) {
        return res.status(400).json({ success: false, error: 'start date or end date not informed' })
    }

    const startDate = new Date(start)
    let endDate = new Date(end)
    endDate.setDate(endDate.getDate() + 1)

    const jobs = await Job.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
        where: {
            paid: true,
            createdAt: {
                [Op.gt]: startDate,
                [Op.lt]: endDate
            }
        },
        include: [
            {
                model: Contract,
                include: [{ model: Profile, as: 'Contractor', attributes: ['profession'] }]
            }
        ],
        group: 'Contract->Contractor.profession',
        order: sequelize.literal('SUM(`Job`.`price`) DESC')
    })

    if (!jobs) {
        return res.status(404).end()
    }

    res.json({ profession: jobs.Contract.Contractor.profession, total: jobs.dataValues.total })
})

admin.get('/best-clients', getProfile, async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    let { start, end, limit } = req.query

    if (!start || !end) {
        return res.status(400).json({ success: false, error: 'start date or end date not informed' })
    }

    const startDate = new Date(start)
    let endDate = new Date(end)
    endDate.setDate(endDate.getDate() + 1)

    limit = limit || 2

    let jobs = await Job.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'total']],
        where: {
            paid: true,
            createdAt: {
                [Op.gt]: startDate,
                [Op.lt]: endDate
            }
        },
        include: [
            {
                model: Contract,
                include: [{ model: Profile, as: 'Client', attributes: ['id', 'firstName', 'lastName'] }]
            }
        ],
        group: 'Contract->Client.id',
        order: sequelize.literal('SUM(`Job`.`price`) DESC'),
        limit
    })
    jobs = jobs.map(el => ({ id: el.Contract.Client.id, fullName: `${el.Contract.Client.firstName} ${el.Contract.Client.lastName}`, paid: el.dataValues.total }))

    res.json({ jobs })
})

module.exports = { admin }