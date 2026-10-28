import express from 'express'
import produtoModelo from '../../models/produtoModelo.mjs'

const rota = express.Router()

function completarImagem(requisicao, produto) {
    if (!produto || !produto.imagem) return produto

    const imagem = String(produto.imagem).trim()

    if (imagem.startsWith('/')) {
        return { ...produto, imagem: `${requisicao.protocol}://${requisicao.get('host')}${encodeURI(imagem)}` }
    }

    return { ...produto, imagem }
}

// GET /api/produto  — lista todos, ou busca com ?q=termo
rota.get('/', async (requisicao, resposta) => {
    try {
        const termo = requisicao.query.q ? requisicao.query.q.trim() : null

        const produtos = termo
            ? await produtoModelo.buscar(termo)
            : await produtoModelo.obterTodosOsDados()

        resposta.json({ sucesso: true, produtos: produtos.map(p => completarImagem(requisicao, p)) })

    } catch (erro) {
        console.error('Erro na API de produtos:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar os produtos.' })
    }
})

// GET /api/produto/:uid — um produto específico
rota.get('/:uid', async (requisicao, resposta) => {
    try {
        const produto = await produtoModelo.obterPeloUID(requisicao.params.uid)

        if (!produto) {
            return resposta.status(404).json({ sucesso: false, erro: 'Produto não encontrado.' })
        }

        resposta.json({ sucesso: true, produto: completarImagem(requisicao, produto) })

    } catch (erro) {
        console.error('Erro na API de produto:', erro.message)
        resposta.status(500).json({ sucesso: false, erro: 'Não foi possível carregar o produto.' })
    }
})

export default rota