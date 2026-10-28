import express from 'express'
import PedidoModelo from '../../models/pedidoModelo.mjs'
import { acompanhar } from '../../models/acompanhamento.mjs'

const rota = express.Router()

// GET /api/pedido — pedidos de quem está logado
rota.get('/', async (requisicao, resposta) => {
    const usuario = requisicao.session?.usuario
    if (!usuario) {
        return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
    }

    try {
        const lista = await PedidoModelo.listarPorUsuario(usuario.id)
        const pedidos = lista.map(p => {
            const a = acompanhar(p.DataPedido)
            return { ...p, previsaoEntrega: a.previsaoTexto, etapa: a.etapa, status: a.status }
        })
        resposta.json({ sucesso: true, pedidos })
    } catch (erro) {
        console.error(erro)
        resposta.status(500).json({ sucesso: false, erro: 'Erro ao buscar pedidos.' })
    }
})

export default rota