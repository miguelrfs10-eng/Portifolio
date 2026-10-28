import CarrinhoModelo from "../models/carrinhoModelo.mjs"
import PedidoModelo from "../models/pedidoModelo.mjs"

const carrinho = {

    async finalizarPagina(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const usuarioID = requisicao.session.usuario.id

            const lista =
                await CarrinhoModelo.obterPorUsuario(usuarioID)

            resposta.render('carrinho/finalizar', {
                lista
            })

        } catch (erro) {

            console.error(
                'Erro ao carregar finalização:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível carregar a finalização da compra agora.')
        }
    },


    async finalizarCompra(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const usuarioID =
                requisicao.session.usuario.id

            const lista =
                await CarrinhoModelo.obterPorUsuario(usuarioID)

            if (!lista || lista.length === 0) {
                return resposta.redirect('/carrinho')
            }

            await PedidoModelo.garantirTabelas()

            const pedido =
                await PedidoModelo.criarPedido({

                    UsuarioID: usuarioID,

                    Nome: requisicao.body.nome,

                    Endereco: requisicao.body.endereco,

                    Cidade: requisicao.body.cidade,

                    Estado: requisicao.body.estado,

                    CEP: requisicao.body.cep,

                    Pagamento: requisicao.body.pagamento,

                    lista

                })

            console.log('Compra finalizada com sucesso!')

            console.log('Pedido:', pedido.PedidoID)

            console.log('Usuário:', usuarioID)

            console.log('Total:', pedido.Total)

            requisicao.session.ultimoPedido = { id: pedido.PedidoID, data: new Date().toISOString() }

            resposta.redirect('/carrinho/concluida')

        } catch (erro) {

            console.error(
                'Erro ao finalizar compra:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível finalizar a compra agora.')
        }
    },


    async index(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const lista =
                await CarrinhoModelo.obterPorUsuario(
                    requisicao.session.usuario.id
                )

            resposta.render('carrinho/index', {
                lista
            })

        } catch (erro) {

            console.error(
                'Erro ao carregar carrinho:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível carregar o carrinho agora.')
        }
    },


    async criar(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const UsuarioID =
                requisicao.session.usuario.id

            const {
                ProdutoUID,
                Quantidade
            } = requisicao.body

            await CarrinhoModelo.criarItem({

                UsuarioID,

                ProdutoUID,

                Quantidade: Quantidade || 1

            })

            resposta.redirect('/carrinho')

        } catch (erro) {

            console.error(
                'Erro ao criar item do carrinho:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível adicionar este item agora.')
        }
    },

    // Botão "Comprar": adiciona o item ao carrinho e já manda direto pra finalizar a compra
    async comprarAgora(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const UsuarioID =
                requisicao.session.usuario.id

            const {
                ProdutoUID,
                Quantidade
            } = requisicao.body

            await CarrinhoModelo.criarItem({

                UsuarioID,

                ProdutoUID,

                Quantidade: Quantidade || 1

            })

            resposta.redirect('/carrinho/finalizar')

        } catch (erro) {

            console.error(
                'Erro ao comprar agora:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível processar a compra agora.')
        }
    },

    async edicaoFormulario(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const id = Number(requisicao.params.id)

            if (!Number.isInteger(id)) {
                return resposta.status(404).send('Item não encontrado')
            }

            // Só encontra o item se ele for do usuário logado
            const item =
                await CarrinhoModelo.obterPeloIDDoUsuario(
                    id,
                    requisicao.session.usuario.id
                )

            if (!item) {
                return resposta.status(404).send('Item não encontrado')
            }

            resposta.render('carrinho/editar', {
                item,
                erro: null
            })

        } catch (erro) {

            console.error(
                'Erro ao carregar item para edição:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível carregar o item agora.')
        }
    },

    async atualizar(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            const id = Number(requisicao.params.id)
            const usuarioID = requisicao.session.usuario.id

            if (!Number.isInteger(id)) {
                return resposta.status(404).send('Item não encontrado')
            }

            const item =
                await CarrinhoModelo.obterPeloIDDoUsuario(id, usuarioID)

            if (!item) {
                return resposta.status(404).send('Item não encontrado')
            }

            const quantidade = Number(requisicao.body.Quantidade)

            if (!Number.isInteger(quantidade) || quantidade < 1) {
                return resposta.status(400).render('carrinho/editar', {
                    item,
                    erro: 'Informe uma quantidade de pelo menos 1'
                })
            }

            if (quantidade > item.Estoque) {
                return resposta.status(400).render('carrinho/editar', {
                    item,
                    erro: `Só temos ${item.Estoque} unidade(s) em estoque`
                })
            }

            await CarrinhoModelo.atualizarQuantidade(
                id,
                usuarioID,
                quantidade
            )

            resposta.redirect('/carrinho')

        } catch (erro) {

            console.error(
                'Erro ao atualizar item do carrinho:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível atualizar este item agora.')
        }
    },

    async remover(requisicao, resposta) {

        try {

            if (!requisicao.session?.usuario) {
                return resposta.redirect('/logar/login')
            }

            await CarrinhoModelo.remover(
                requisicao.params.id,
                requisicao.session.usuario.id
            )

            resposta.redirect('/carrinho')

        } catch (erro) {

            console.error(
                'Erro ao remover item do carrinho:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível remover este item agora.')
        }
    }

}

export default carrinho