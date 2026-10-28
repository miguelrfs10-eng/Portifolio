import express from 'express'
import PoliticaModelo from '../../models/PoliticaModelo.mjs'

const rota = express.Router()

// GET /api/politica — conteúdo da política de privacidade
rota.get('/', async (requisicao, resposta) => {
    try {
        const politica = await PoliticaModelo.obterConteudo()

        resposta.json({ sucesso: true, politica })

    } catch (erro) {
        console.error('Erro na API de política:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar a política de privacidade.' })
    }
})

export default rota