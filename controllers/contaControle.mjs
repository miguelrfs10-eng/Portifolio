import PedidoModelo from '../models/pedidoModelo.mjs'
import UsuarioModelo from '../models/usuarioModelo.mjs'
import { acompanhar } from '../models/acompanhamento.mjs'

class ContaControle {

    // GET /usuarios/pedidos
    static async pedidos(requisicao, resposta) {
        try {
            const lista = await PedidoModelo.listarPorUsuario(requisicao.session.usuario.id)
            const pedidos = lista.map(p => ({ ...p, acomp: acompanhar(p.DataPedido) }))
            resposta.render('pedidos/index', { pedidos })
        } catch (erro) {
            console.error(erro)
            resposta.status(500).send('Erro ao carregar seus pedidos.')
        }
    }

    // GET /usuarios/perfil
    static async perfil(requisicao, resposta) {
        const sessao = requisicao.session.usuario
        let conta = { nome: sessao.nome, email: sessao.email, telefone: '' }

        try {
            if (sessao.tipo === 'cliente') {
                const usuario = await UsuarioModelo.obterPeloUID(sessao.id)
                if (usuario) conta = { nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '' }
            }
        } catch (erro) {
            console.error(erro)
        }

        resposta.render('perfil/index', { conta })
    }
}

export default ContaControle