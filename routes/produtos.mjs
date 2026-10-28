import express from 'express'
import produtoControle from '../controllers/produtoControle.mjs'
import { garantirEntradaNaRota, somenteAdmin } from '../middlewares/loginApp.mjs'

const rota = express.Router()

// Públicas: qualquer pessoa pode ver
rota.get('/', produtoControle.index)

// Cadastro, edição e remoção: só administrador
rota.get('/novo', somenteAdmin, produtoControle.novoFormulario)
rota.post('/', somenteAdmin, produtoControle.criar)

// Pública
rota.get('/:uid', produtoControle.mostrar)

rota.get('/:uid/editar', somenteAdmin, produtoControle.edicaoFormulario)
rota.post('/:uid/atualizar', somenteAdmin, produtoControle.atualizar)
rota.post('/:uid/deletar', somenteAdmin, produtoControle.remover)

export default rota