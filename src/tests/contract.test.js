const request = require('supertest')
const app = require('../app')

describe('contracts', () => {
    it('should return 401 when not passing header', async () => {
        const res = await request(app).get('/contracts')

        expect(res.status).toBe(401)
    })

    it('should return all contracts for profile 1', async () => {
        const res = await request(app)
            .get('/contracts')
            .set({ 'profile_id': 1 })

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
    })

    it('should return all contracts for profile 2', async () => {
        const res = await request(app)
            .get('/contracts')
            .set({ 'profile_id': 2 })

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(2)
    })
})

describe('contract', () => {
    it('should return 401 when not passing header', async () => {
        const res = await request(app).get('/contracts/1')

        expect(res.status).toBe(401)
    })

    it('should return the contract 1 for profile 1', async () => {
        const res = await request(app)
            .get('/contracts/1')
            .set({ 'profile_id': 1 })

        expect(res.status).toBe(200)
        expect(res.body).not.toBeNull()
    })

    it('should return the contract 2 for profile 1', async () => {
        const res = await request(app)
            .get('/contracts/2')
            .set({ 'profile_id': 1 })

        expect(res.status).toBe(200)
        expect(res.body).not.toBeNull()
    })

    it('should not return the contract 1 for profile 2', async () => {
        const res = await request(app)
            .get('/contracts/1')
            .set({ 'profile_id': 2 })

        expect(res.status).toBe(404)
        expect(JSON.stringify(res.body)).toBe('{}')
    })
})

describe('jobs', () => {
    describe('unpaid', () => {
        it('should return 401 when not passing header', async () => {
            const res = await request(app).get('/jobs/unpaid')

            expect(res.status).toBe(401)
        })

        it('should return one job for profile 1', async () => {
            const res = await request(app)
                .get('/jobs/unpaid')
                .set({ 'profile_id': 1 })

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
        })

        it('should return two jobs for profile 2', async () => {
            const res = await request(app)
                .get('/jobs/unpaid')
                .set({ 'profile_id': 2 })

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(2)
        })

        it('should return no jobs for profile 3', async () => {
            const res = await request(app)
                .get('/jobs/unpaid')
                .set({ 'profile_id': 3 })

            expect(res.status).toBe(200)
            expect(res.body.length).toBe(0)
        })
    })

    describe('pay', () => {
        it('should return 401 when not passing header', async () => {
            const res = await request(app).post('/jobs/1/pay')

            expect(res.status).toBe(401)
        })

        it('should pay job 1 for profile 1', async () => {
            const res = await request(app)
                .post('/jobs/1/pay')
                .set({ 'profile_id': 1 })

            expect(res.status).toBe(200)
            expect(res.body.job.paid).toBe(true)
        })

        it('should not pay job 5 for profile 4', async () => {
            const res = await request(app)
                .post('/jobs/5/pay')
                .set({ 'profile_id': 4 })

            console.log('res.body', res.body)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('the client has no balance to pay for the job')
        })

        it('should return 400 when job 1 for profile 3', async () => {
            const res = await request(app)
                .post('/jobs/1/pay')
                .set({ 'profile_id': 3 })

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.error).toBe('the client does not belongs to the contract')
        })
    })
})

describe('balances deposit', () => {
    it('should return 401 when not passing header', async () => {
        const res = await request(app).post('/balances/deposit/1')

        expect(res.status).toBe(401)
    })

    it('should add to balance for user 1', async () => {
        const res = await request(app)
            .get('/jobs/unpaid')
            .set({ 'profile_id': 3 })

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(0)
    })
})