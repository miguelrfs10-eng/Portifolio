import express, { Router } from 'express'

import usuarioControle from '../controllers/usuarioControle.mjs'
import contaControle from '../controllers/contaControle.mjs'
import enderecoControle from '../controllers/enderecoControle.mjs'
import { garantirEntradaNaRota, somenteAdmin } from '../middlewares/loginApp.mjs'

const rota = Router()

// Páginas do próprio cliente (pedidos, conta e endereço exigem login)
rota.get('/pedidos', garantirEntradaNaRota, contaControle.pedidos)

rota.get('/suporte', (req, res) => {
    res.render('suporte/index')
})

rota.get('/perfil', garantirEntradaNaRota, contaControle.perfil)

// Endereço do cliente: ver, editar e salvar
rota.get('/endereco', garantirEntradaNaRota, enderecoControle.mostrar)
rota.get('/endereco/editar', garantirEntradaNaRota, enderecoControle.editarFormulario)
rota.post('/endereco', garantirEntradaNaRota, enderecoControle.salvar)

rota.get('/localizacao', (req, res) => {
    res.render('localizacao/index')
})

// Gestão de usuários (somente admin)
rota.get('/', somenteAdmin, usuarioControle.index)                  // Listar todos
rota.get('/novo', somenteAdmin, usuarioControle.novoFormulario)     // Formulário de criação
rota.post('/', somenteAdmin, usuarioControle.criar)                 // Criar novo
rota.get('/:uid', somenteAdmin, usuarioControle.mostrar)            // Ver detalhes
rota.get('/:uid/editar', somenteAdmin, usuarioControle.edicaoFormulario)  // Formulário de edição
rota.post('/:uid/atualizar', somenteAdmin, usuarioControle.atualizar)     // Atualizar
rota.post('/:uid/remover', somenteAdmin, usuarioControle.remover)         // Remover

export default rota