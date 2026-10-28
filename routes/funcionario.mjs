import express from 'express'
import funcionarios from '../controllers/funcionarioControle.mjs'
import { somenteAdmin } from '../middlewares/loginApp.mjs'

const rota = express.Router()

// Todas as rotas de funcionários são exclusivas para administradores
rota.use(somenteAdmin)

rota.get('/', funcionarios.index)
rota.get('/novo', funcionarios.novoFormulario)
rota.post('/', funcionarios.criar)
rota.get('/:id', funcionarios.mostrar)
rota.get('/:id/editar', funcionarios.edicaoFormulario)
rota.post('/:id/atualizar', funcionarios.atualizar)
rota.post('/:id/remover', funcionarios.remover)

export default rota