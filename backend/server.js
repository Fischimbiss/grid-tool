import express from 'express'

const app = express()
app.use(express.json())

const users = []
const roles = []
const groups = []
const auditLogs = []

const log = (entity, action, details) => {
  auditLogs.push({ id: Date.now(), entity, action, timestamp: Date.now(), details })
}

function crudRoutes(path, store) {
  app.get(path, (_, res) => res.json(store))
  app.post(path, (req, res) => {
    const item = { id: Date.now(), ...req.body }
    store.push(item)
    log(path, 'create', item)
    res.json(item)
  })
  app.put(`${path}/:id`, (req, res) => {
    const id = Number(req.params.id)
    const idx = store.findIndex(i => i.id === id)
    if (idx === -1) return res.sendStatus(404)
    store[idx] = { ...store[idx], ...req.body }
    log(path, 'update', store[idx])
    res.json(store[idx])
  })
  app.delete(`${path}/:id`, (req, res) => {
    const id = Number(req.params.id)
    const idx = store.findIndex(i => i.id === id)
    if (idx === -1) return res.sendStatus(404)
    const [removed] = store.splice(idx, 1)
    log(path, 'delete', removed)
    res.json(removed)
  })
}

crudRoutes('/users', users)
crudRoutes('/roles', roles)
crudRoutes('/groups', groups)

app.get('/audit-logs', (_, res) => res.json(auditLogs))

app.listen(3001, () => {
  console.log('API server running on http://localhost:3001')
})
