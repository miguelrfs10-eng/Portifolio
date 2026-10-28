import express from 'express'
import carrinho from '../controllers/carrinhoControle.mjs'
import { acompanhar } from '../models/acompanhamento.mjs'
import { somenteCliente } from '../middlewares/loginApp.mjs'

const rota = express.Router()

// Carrinho e compras: somente clientes (funcionário vê o aviso "Somente clientes compram")
rota.get('/', somenteCliente, carrinho.index)                       // Carrinho do usuário logado

rota.post('/novo', somenteCliente, carrinho.criar)                  // Adiciona item ao carrinho

rota.post('/comprar', somenteCliente, carrinho.comprarAgora)        // Botão "Comprar": vai direto pra finalizar

rota.get('/finalizar', somenteCliente, carrinho.finalizarPagina)    // Tela de finalizar compra

rota.post('/finalizar', somenteCliente, carrinho.finalizarCompra)   // Confirma a compra

rota.get('/concluida', somenteCliente, (req, res) => {
    const ultimo = req.session?.ultimoPedido
    const pedido = ultimo ? { id: ultimo.id, acomp: acompanhar(ultimo.data) } : null
    res.render('carrinho/concluida', { pedido })
})

rota.get('/:id/editar', somenteCliente, carrinho.edicaoFormulario)  // Tela para mudar a quantidade

rota.post('/:id/editar', somenteCliente, carrinho.atualizar)        // Salva a nova quantidade

rota.post('/:id/deletar', somenteCliente, carrinho.remover)         // Remove item do próprio carrinho

export default rota