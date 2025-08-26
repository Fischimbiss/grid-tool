import express from 'express'
import session from 'express-session'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(express.json())
app.use(
  session({
    secret: 'dev-secret',
    resave: false,
    saveUninitialized: false,
  })
)

const prisma = new PrismaClient()
const auditLogs = []

const log = (entity, action, details) => {
  auditLogs.push({ id: Date.now(), entity, action, timestamp: Date.now(), details })
}

function crudRoutes(path, model, entity) {
  app.get(path, async (_, res) => {
    const items = await model.findMany()
    res.json(items)
  })
  app.post(path, async (req, res) => {
    const item = await model.create({ data: req.body })
    log(entity, 'create', item)
    res.json(item)
  })
  app.put(`${path}/:id`, async (req, res) => {
    const id = Number(req.params.id)
    try {
      const item = await model.update({ where: { id }, data: req.body })
      log(entity, 'update', item)
      res.json(item)
    } catch {
      res.sendStatus(404)
    }
  })
  app.delete(`${path}/:id`, async (req, res) => {
    const id = Number(req.params.id)
    try {
      const removed = await model.delete({ where: { id } })
      log(entity, 'delete', removed)
      res.json(removed)
    } catch {
      res.sendStatus(404)
    }
  })
}

crudRoutes('/api/users', prisma.user, 'users')
crudRoutes('/api/roles', prisma.role, 'roles')
crudRoutes('/api/groups', prisma.group, 'groups')

app.get('/api/audit-logs', (_, res) => res.json(auditLogs))

app.post('/api/login', async (req, res) => {
  const { username } = req.body
  const user = await prisma.user.findFirst({
    where: { name: username },
    include: {
      userRoles: { include: { role: true } },
      userGroups: { include: { group: true } },
    },
  })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  req.session.userId = user.id
  res.json({
    user: {
      id: String(user.id),
      name: user.name,
      roles: user.userRoles.map((ur) => ({ id: String(ur.role.id), name: ur.role.name })),
      groups: user.userGroups.map((ug) => ({ id: String(ug.group.id), name: ug.group.name })),
    },
  })
})

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {})
  res.sendStatus(200)
})

app.get('/api/session', async (req, res) => {
  if (!req.session.userId) return res.sendStatus(401)
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    include: {
      userRoles: { include: { role: true } },
      userGroups: { include: { group: true } },
    },
  })
  if (!user) return res.sendStatus(401)
  res.json({
    user: {
      id: String(user.id),
      name: user.name,
      roles: user.userRoles.map((ur) => ({ id: String(ur.role.id), name: ur.role.name })),
      groups: user.userGroups.map((ug) => ({ id: String(ug.group.id), name: ug.group.name })),
    },
  })
})

app.listen(3001, () => {
  console.log('API server running on http://localhost:3001')
})
