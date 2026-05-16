import { prisma } from '../src/config/prisma.js'
import { logger } from '../src/config/logger.js'

async function main() {
  logger.info('Starting database seed...')

  // Exemplo de planos de aula
  const planos = [
    {
      title: 'Introdução ao OSPF',
      objective: 'Compreender os conceitos fundamentais de OSPF (Open Shortest Path First)',
      summary: 'Aula teórica sobre roteamento dinâmico e protocolo OSPF. Covers basics de Link-State routing.',
      scheduledAt: new Date('2026-05-20T10:00:00'),
      discipline: 'Redes',
      contents: '1. Conceitos de roteamento\n2. OSPF vs RIP\n3. Algoritmo Dijkstra\n4. Configuração prática',
      resources: 'Livro "TCP/IP Illustrated", Cisco Learning Network',
      tags: ['roteamento', 'ospf', 'networking', 'ccna'],
    },
    {
      title: 'Introdução a Banco de Dados',
      objective: 'Fundamentos de modelagem e design de banco de dados relacional',
      summary: 'Aula introdutória sobre banco de dados, modelos de dados, and SQL basics.',
      scheduledAt: new Date('2026-05-22T14:00:00'),
      discipline: 'Banco de Dados',
      contents: '1. Modelos de dados\n2. Normalização\n3. SQL DDL e DML\n4. Diagrama ER',
      resources: 'PostgreSQL docs, exercícios práticos',
      tags: ['database', 'sql', 'postgresql', 'er-diagram'],
    },
    {
      title: 'Programação Orientada a Objetos em Python',
      objective: 'Aprender conceitos de OOP e aplicá-los em Python',
      summary: 'Classes, herança, polimorfismo, e encapsulamento em Python.',
      scheduledAt: new Date('2026-05-25T09:00:00'),
      discipline: 'Programação',
      contents: '1. Classes e objetos\n2. Herança e polimorfismo\n3. Encapsulamento\n4. Projeto prático',
      resources: 'Python Official Docs, Real Python tutorials',
      tags: ['python', 'oop', 'programação', 'poo'],
    },
    {
      title: 'Deploy com Docker e Kubernetes',
      objective: 'Aprender containerização e orquestração de aplicações',
      summary: 'Introdução a Docker e Kubernetes para deployment moderno.',
      scheduledAt: new Date('2026-06-01T16:00:00'),
      discipline: 'DevOps',
      contents:
        '1. Docker basics\n2. Dockerfile e multi-stage builds\n3. Docker Compose\n4. Kubernetes basics\n5. Helm charts',
      resources: 'Docker Official Docs, Kubernetes.io',
      tags: ['docker', 'kubernetes', 'devops', 'containerization'],
    },
  ]

  for (const plano of planos) {
    const created = await prisma.lessonPlan.create({
      data: plano,
    })
    logger.info({ id: created.id, title: created.title }, 'Lesson plan created')
  }

  logger.info('Database seed completed successfully!')
}

main()
  .catch((e) => {
    logger.error({ err: e }, 'Seed failed')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })