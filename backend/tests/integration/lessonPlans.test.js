import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { buildApp } from '../../src/app.js'
import { prisma } from '../../src/config/prisma.js'

describe('Lesson Plans CRUD', () => {
  let app
  let createdPlanId

  beforeAll(async () => {
    app = await buildApp()
    await prisma.lessonPlan.deleteMany({})
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('should create a lesson plan', async () => {
    const response = await request(app.server)
      .post('/api/lesson-plans')
      .send({
        title: 'Introdução ao OSPF',
        objective: 'Compreender os conceitos básicos de OSPF',
        summary: 'Aula sobre Open Shortest Path First',
        scheduledAt: new Date().toISOString(),
        discipline: 'Redes',
        contents: 'Conteúdo sobre roteamento',
        resources: 'Livro de Redes',
        tags: ['roteamento', 'ospf'],
      })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    createdPlanId = response.body.id
  })

  it('should retrieve all lesson plans', async () => {
    const response = await request(app.server).get('/api/lesson-plans')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.plans)).toBe(true)
  })

  it('should retrieve a single lesson plan', async () => {
    const response = await request(app.server).get(`/api/lesson-plans/${createdPlanId}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(createdPlanId)
  })

  it('should update a lesson plan', async () => {
    const response = await request(app.server)
      .put(`/api/lesson-plans/${createdPlanId}`)
      .send({
        title: 'Introdução Avançada ao OSPF',
      })

    expect(response.status).toBe(200)
    expect(response.body.title).toBe('Introdução Avançada ao OSPF')
  })

  it('should delete a lesson plan', async () => {
    const response = await request(app.server).delete(`/api/lesson-plans/${createdPlanId}`)

    expect(response.status).toBe(204)
  })
})