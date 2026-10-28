import express from 'express'

import logarControle from '../controllers/logarControle.mjs'

const rota = express.Router()

rota.get('/login', logarControle.login)

rota.post('/login', logarControle.processarLogin)

rota.get('/logout', logarControle.logout)

rota.get('/callback', (requisicao, resposta) => {
    resposta.redirect('/logar/login')
})

rota.get('/cadastro', logarControle.cadastroFormulario)

rota.post('/cadastro', logarControle.processarCadastro)

export default rota