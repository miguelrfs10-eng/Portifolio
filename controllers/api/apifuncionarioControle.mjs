import express from 'express'
import funcionarioModelo from '../../models/funcionarioModelo.mjs'

const rota = express.Router()

// Só administrador acessa esta API
rota.use((requisicao, resposta, proximo) => {
    const usuario = requisicao.session?.usuario

    if (!usuario) {
        return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
    }

    if (usuario.tipo !== 'admin') {
        return resposta.status(403).json({ sucesso: false, erro: 'Acesso negado.' })
    }

    proximo()
})

// GET /api/funcionario — lista de funcionários
rota.get('/', async (requisicao, resposta) => {
    try {
        const funcionarios = await funcionarioModelo.obterTodosOsDados()

        resposta.json({ sucesso: true, funcionarios })

    } catch (erro) {
        console.error('Erro na API de funcionários:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar os funcionários.' })
    }
})

// GET /api/funcionario/:id — um funcionário
rota.get('/:id', async (requisicao, resposta) => {
    try {
        const id = Number(requisicao.params.id)

        if (!Number.isInteger(id)) {
            return resposta.status(400).json({ sucesso: false, erro: 'ID inválido.' })
        }

        const funcionario = await funcionarioModelo.obterPeloID(id)

        if (!funcionario) {
            return resposta.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado.' })
        }

        resposta.json({ sucesso: true, funcionario })

    } catch (erro) {
        console.error('Erro na API de funcionário:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar o funcionário.' })
    }
})

export default rota