import express from 'express'
import UsuarioModelo from '../../models/usuarioModelo.mjs'

const rota = express.Router()

// GET /api/usuario/perfil — dados de quem está logado nessa sessão
rota.get('/perfil', async (requisicao, resposta) => {
    const sessao = requisicao.session?.usuario

    if (!sessao) {
        return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
    }

    // Começa com o que já está na sessão (serve também para admin)
    let usuario = { ...sessao, telefone: null }

    try {
        // Cliente: busca o telefone no banco
        if (sessao.tipo === 'cliente') {
            const dados = await UsuarioModelo.obterPeloUID(sessao.id)
            if (dados) {
                usuario = { ...sessao, nome: dados.nome, email: dados.email, telefone: dados.telefone || null }
            }
        }
    } catch (erro) {
        console.error('Erro ao buscar perfil via API:', erro.message)
    }

    resposta.json({ sucesso: true, usuario })
})

export default rota