import express from 'express'
import CarrinhoModelo from '../../models/carrinhoModelo.mjs'
import PedidoModelo from '../../models/pedidoModelo.mjs'
import { acompanhar } from '../../models/acompanhamento.mjs'

const rota = express.Router()

// GET /api/carrinho — itens do carrinho do usuário logado
rota.get('/', async (requisicao, resposta) => {
    try {
        if (!requisicao.session?.usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
        }

        const lista = await CarrinhoModelo.obterPorUsuario(requisicao.session.usuario.id)

        resposta.json({ sucesso: true, lista })

    } catch (erro) {
        console.error('Erro na API do carrinho:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar o carrinho.' })
    }
})

// POST /api/carrinho — body: { ProdutoUID, Quantidade }
rota.post('/', async (requisicao, resposta) => {
    try {
        if (!requisicao.session?.usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
        }

        const { ProdutoUID, Quantidade } = requisicao.body

        await CarrinhoModelo.criarItem({
            UsuarioID: requisicao.session.usuario.id,
            ProdutoUID,
            Quantidade: Quantidade || 1
        })

        resposta.json({ sucesso: true })

    } catch (erro) {
        console.error('Erro ao adicionar item via API:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível adicionar este item.' })
    }
})

// POST /api/carrinho/:id/deletar — remove um item do carrinho
rota.post('/:id/deletar', async (requisicao, resposta) => {
    try {
        if (!requisicao.session?.usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
        }

        await CarrinhoModelo.remover(requisicao.params.id, requisicao.session.usuario.id)

        resposta.json({ sucesso: true })

    } catch (erro) {
        console.error('Erro ao remover item via API:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível remover este item.' })
    }
})

// POST /api/carrinho/finalizar — body: { nome, endereco, cidade, estado, cep, pagamento }
rota.post('/finalizar', async (requisicao, resposta) => {
    try {
        if (!requisicao.session?.usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
        }

        const { nome, endereco, cidade, estado, cep, pagamento } = requisicao.body || {}

        if (!nome || !endereco || !cidade || !estado || !cep || !pagamento) {
            return resposta.status(400).json({ sucesso: false, erro: 'Preencha todos os dados da entrega.' })
        }

        if (String(estado).trim().length !== 2) {
            return resposta.status(400).json({ sucesso: false, erro: 'Informe o estado com 2 letras.' })
        }

        const usuarioID = requisicao.session.usuario.id
        const lista = await CarrinhoModelo.obterPorUsuario(usuarioID)

        if (!lista || lista.length === 0) {
            return resposta.status(400).json({ sucesso: false, erro: 'Seu carrinho está vazio.' })
        }

        await PedidoModelo.garantirTabelas()

        const pedido = await PedidoModelo.criarPedido({
            UsuarioID: usuarioID,
            Nome: nome,
            Endereco: endereco,
            Cidade: cidade,
            Estado: String(estado).trim().toUpperCase(),
            CEP: cep,
            Pagamento: pagamento,
            lista
        })

        const a = acompanhar(new Date())
        resposta.json({ sucesso: true, pedido: pedido.PedidoID, total: pedido.Total, previsaoEntrega: a.previsaoTexto, etapa: a.etapa, status: a.status })

    } catch (erro) {
        console.error('Erro ao finalizar compra via API:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível finalizar a compra agora.' })
    }
})

// POST /api/carrinho/:id/editar — body: { Quantidade }
rota.post('/:id/editar', async (requisicao, resposta) => {
    try {
        if (!requisicao.session?.usuario) {
            return resposta.status(401).json({ sucesso: false, erro: 'Não está logado.' })
        }

        const id = Number(requisicao.params.id)
        const quantidade = Number(requisicao.body.Quantidade)
        const usuarioID = requisicao.session.usuario.id

        if (!Number.isInteger(id) || !Number.isInteger(quantidade) || quantidade < 1) {
            return resposta.status(400).json({ sucesso: false, erro: 'Quantidade inválida.' })
        }

        const item = await CarrinhoModelo.obterPeloIDDoUsuario(id, usuarioID)

        if (!item) {
            return resposta.status(404).json({ sucesso: false, erro: 'Item não encontrado.' })
        }

        await CarrinhoModelo.atualizarQuantidade(id, usuarioID, quantidade)

        resposta.json({ sucesso: true })

    } catch (erro) {
        console.error('Erro ao editar item via API:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível atualizar este item.' })
    }
})

export default rota