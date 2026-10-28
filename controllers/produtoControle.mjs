import produtoModelo from '../models/produtoModelo.mjs'

// Aceita link completo (http:// ou https://) OU caminho local (começando com /)
function limparImagem(url) {
    const texto = (url || '').trim()
    if (/^https?:\/\//i.test(texto)) return texto
    if (/^\//.test(texto)) return texto
    return null
}

const produtos = {

    // Lista todos os produtos ou pesquisa por um termo
    async index(requisicao, resposta) {
        try {
            const termo = requisicao.query.q
                ? requisicao.query.q.trim()
                : null

            const produtos = termo
                ? await produtoModelo.buscar(termo)
                : await produtoModelo.obterTodosOsDados()

            if (termo) {
                return resposta.render('produtos/busca', { produtos, termo })
            }

            resposta.render('produtos/index', { produtos })

        } catch (erro) {
            console.error('Erro ao carregar produtos:', erro.message)

            resposta
                .status(500)
                .send('Não foi possível carregar os produtos agora. Tente novamente em instantes.')
        }
    },

    // Cria um novo produto
    async criar(requisicao, resposta) {
        try {

            const {
                nome,
                descricao,
                categoria,
                marca,
                imagem,
                preco,
                quantidade
            } = requisicao.body

            await produtoModelo.criarProduto({
                nome,
                descricao,
                categoria,
                marca,
                imagem: limparImagem(imagem),
                preco,
                quantidade
            })

            resposta.redirect('/produto')

        } catch (erro) {
            console.error('Erro ao criar produto:', erro.message)

            resposta
                .status(500)
                .send('Não foi possível salvar o produto agora.')
        }
    },

    // Exibe o formulário para cadastrar um produto
    novoFormulario(requisicao, resposta) {
        resposta.render('produtos/novo')
    },

    // Exibe um produto específico
    async mostrar(requisicao, resposta) {
        try {

            const produto = await produtoModelo.obterPeloUID(
                requisicao.params.uid
            )

            if (!produto) {
                return resposta
                    .status(404)
                    .send('Produto não encontrado')
            }

            const todos = await produtoModelo.obterTodosOsDados()

            resposta.render('produtos/mostrar', { produto, outros: todos })

        } catch (erro) {
            console.error('Erro ao carregar produto:', erro.message)

            resposta
                .status(500)
                .send('Não foi possível carregar este produto agora.')
        }
    },

    // Exibe o formulário de edição
    async edicaoFormulario(requisicao, resposta) {
        try {

            const produto = await produtoModelo.obterPeloUID(
                requisicao.params.uid
            )

            if (!produto) {
                return resposta
                    .status(404)
                    .send('Produto não encontrado')
            }

            resposta.render('produtos/editar', { produto })

        } catch (erro) {
            console.error(
                'Erro ao carregar produto para edição:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível carregar o produto para edição.')
        }
    },

    // Atualiza um produto existente
    async atualizar(requisicao, resposta) {
        try {

            const {
                nome,
                descricao,
                categoria,
                marca,
                imagem,
                preco,
                quantidade
            } = requisicao.body

            const produtoAtual = await produtoModelo.obterPeloUID(
                requisicao.params.uid
            )

            if (!produtoAtual) {
                return resposta
                    .status(404)
                    .send('Produto não encontrado')
            }

            await produtoModelo.editar(
                requisicao.params.uid,
                {
                    nome,
                    descricao,
                    categoria,
                    marca,
                    imagem: limparImagem(imagem),
                    preco,
                    quantidade
                }
            )

            resposta.redirect('/produto')

        } catch (erro) {
            console.error(
                'Erro ao atualizar produto:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível atualizar o produto agora.')
        }
    },

    // Remove um produto
    async remover(requisicao, resposta) {
        try {

            await produtoModelo.remover(
                requisicao.params.uid
            )

            resposta.redirect('/produto')

        } catch (erro) {
            console.error(
                'Erro ao remover produto:',
                erro.message
            )

            resposta
                .status(500)
                .send('Não foi possível remover o produto agora.')
        }
    }
}

export default produtos