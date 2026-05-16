import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import { buildApp } from '../src/app.js'

describe('Health Check', () => {
  let app

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return health status', async () => {
    const response = await request(app.server).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('status', 'ok')
    expect(response.body).toHaveProperty('db')
    expect(response.body).toHaveProperty('redis')
  })
})