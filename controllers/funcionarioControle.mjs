import funcionarioModelo from '../models/funcionarioModelo.mjs'
import produtoModelo from '../models/produtoModelo.mjs'
import UsuarioModelo from '../models/usuarioModelo.mjs'

const funcionarios = {
    async index(requisicao, resposta) {
        try {
            const funcionarios = await funcionarioModelo.obterTodosOsDados()
            resposta.render('funcionarios/index', { funcionarios })
        } catch (erro) {
            console.error('Erro ao carregar funcionários:', erro.message)
            resposta.status(500).send('Não foi possível carregar os funcionários agora.')
        }
    },
    async novoFormulario(requisicao, resposta) {
        try {
            const funcionario = await funcionarioModelo.obterTodosOsDados()
            const usuario = await UsuarioModelo.obterTodosOsDados()
            const produtos = await produtoModelo.obterTodosOsDados()
            resposta.render('funcionarios/novo', {
                funcionario, usuario, produtos
            })
        } catch (erro) {
            console.error('Erro ao carregar formulário de funcionário:', erro.message)
            resposta.status(500).send('Não foi possível carregar esta página agora.')
        }
    },

    async criar(requisicao, resposta) {
        try {
            const { nomeUsuario, senha, nomeCompleto, cargo, email } = requisicao.body
            await funcionarioModelo.criarFuncionario({ nomeUsuario, senha, nomeCompleto, cargo, email })
            resposta.redirect('/funcionarios')
        } catch (erro) {
            console.error('Erro ao criar funcionário:', erro.message)
            resposta.status(500).send('Não foi possível salvar o funcionário agora.')
        }
    },

    async mostrar(requisicao, resposta) {
        try {
            const funcionario = await funcionarioModelo.obterPeloID(requisicao.params.id)
            if (!funcionario) return resposta.redirect('/funcionarios')
            resposta.render('funcionarios/mostrar', { funcionario })
        } catch (erro) {
            console.error('Erro ao carregar funcionário:', erro.message)
            resposta.status(500).send('Não foi possível carregar este funcionário agora.')
        }
    },

    async edicaoFormulario(requisicao, resposta) {
        try {
            const funcionario = await funcionarioModelo.obterPeloID(requisicao.params.id)
            if (!funcionario) return resposta.redirect('/funcionarios')
            resposta.render('funcionarios/editar', { funcionario })
        } catch (erro) {
            console.error('Erro ao carregar funcionário para edição:', erro.message)
            resposta.status(500).send('Não foi possível carregar este funcionário agora.')
        }
    },

    async atualizar(requisicao, resposta) {
        try {
            const { nomeUsuario, nomeCompleto, cargo, email } = requisicao.body
            await funcionarioModelo.editar(requisicao.params.id, { nomeUsuario, nomeCompleto, cargo, email })
            resposta.redirect('/funcionarios')
        } catch (erro) {
            console.error('Erro ao atualizar funcionário:', erro.message)
            resposta.status(500).send('Não foi possível atualizar o funcionário agora.')
        }
    },

    async remover(requisicao, resposta) {
        try {
            await funcionarioModelo.remover(requisicao.params.id)
            resposta.redirect('/funcionarios')
        } catch (erro) {
            console.error('Erro ao remover funcionário:', erro.message)
            resposta.status(500).send('Não foi possível remover o funcionário agora.')
        }
    }
}

export default funcionarios