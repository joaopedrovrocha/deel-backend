const services = {
    getBestProfession: async (start, end) => {
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

        return jobs
    }
}

module.exports = services