const { Router } = require("express");
const { getProfile } = require("./middleware/getProfile");
const { Op } = require("sequelize");

const contracts = Router()

contracts.get('/', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const profile = req.profile

    const contract = await Contract.findAll({
        where: {
            [Op.or]: [
                { ContractorId: profile.id }, { ClientId: profile.id }
            ],
            status: {
                [Op.not]: 'terminated'
            }
        }
    })

    res.json(contract)
})

contracts.get('/:id', getProfile, async (req, res) => {
    const { Contract } = req.app.get('models')
    const { id } = req.params
    const profile = req.profile

    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                { ContractorId: profile.id }, { ClientId: profile.id }
            ]
        }
    })

    if (!contract) return res.status(404).end()

    res.json(contract)
})

module.exports = { contracts }