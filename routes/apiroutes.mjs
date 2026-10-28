import express from 'express'
import apiFuncionario from '../controllers/api/apifuncionarioControle.mjs'
import apiLogar from '../controllers/api/apilogarControle.mjs'
import apiPolitica from '../controllers/api/apiPoliticaControle.mjs'
import apiProduto from '../controllers/api/apiprodutoControle.mjs'
import apiCarrinho from '../controllers/api/apicarrinhoControle.mjs'
import apiPedido from '../controllers/api/apipedidoControle.mjs'
import apiUsuario from '../controllers/api/apiusuarioControle.mjs'

const rota = express.Router()

rota.use('/carrinho', apiCarrinho)
rota.use('/funcionario', apiFuncionario)
rota.use('/logar', apiLogar)
rota.use('/pedido', apiPedido)
rota.use('/politica', apiPolitica)
rota.use('/produto', apiProduto)
rota.use('/usuario', apiUsuario)

export default rota