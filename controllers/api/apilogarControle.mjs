import express from 'express'
import UsuarioModelo from '../../models/usuarioModelo.mjs'

const rota = express.Router()

// POST /api/logar/login  — body: { email, senha }
rota.post('/login', async (requisicao, resposta) => {
    try {
        const { email, senha } = requisicao.body

        if (!email || !senha) {
            return resposta.status(400).json({ sucesso: false, erro: 'Informe email e senha.' })
        }

        const usuario = await UsuarioModelo.autenticar(email, senha)

        if (!usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Email ou senha incorretos.' })
        }

        requisicao.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo: 'cliente',
            provider: 'local',
        }

        requisicao.session.save(() => {
            resposta.json({ sucesso: true, usuario: requisicao.session.usuario })
        })

    } catch (erro) {
        console.error('Erro na API de login:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível fazer login agora.' })
    }
})

// POST /api/logar/cadastro — body: { nome, email, senha, telefone }
rota.post('/cadastro', async (requisicao, resposta) => {
    try {
        const { nome, email, senha, telefone } = requisicao.body

        if (!nome || !email || !senha) {
            return resposta.status(400).json({ sucesso: false, erro: 'Preencha nome, email e senha.' })
        }

        if (senha.length < 6) {
            return resposta.status(400).json({ sucesso: false, erro: 'A senha precisa ter pelo menos 6 caracteres.' })
        }

        await UsuarioModelo.criarUsuario({ nome, email, senha, telefone })

        resposta.json({ sucesso: true })

    } catch (erro) {
        console.error('Erro na API de cadastro:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível concluir o cadastro.' })
    }
})

// POST /api/logar/logout
rota.post('/logout', (requisicao, resposta) => {
    requisicao.session.destroy(() => {
        resposta.json({ sucesso: true })
    })
})

export default rota