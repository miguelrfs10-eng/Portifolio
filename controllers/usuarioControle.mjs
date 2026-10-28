import UsuarioModelo from '../models/usuarioModelo.mjs'

const usuarios = {
    async index(req, res) {
        try {
            const lista = await UsuarioModelo.obterTodosOsDados()
            res.render('usuario/index', { lista, erro: req.query.erro || null })
        } catch (erro) {
            console.error('Erro ao listar usuários:', erro.message)
            res.status(500).send('Erro ao carregar os usuários')
        }
    },

    async novoFormulario(req, res) {
        res.render('usuario/novo', { erro: null })
    },

    async criar(req, res) {
        try {
            await UsuarioModelo.criarUsuario(req.body)
            res.redirect('/usuarios')
        } catch (erro) {
            console.error('Erro ao criar usuário:', erro.message)
            res.status(500).render('usuario/novo', { erro: 'Não foi possível cadastrar o usuário (o e-mail já existe?)' })
        }
    },

    async mostrar(req, res) {
        try {
            const usuario = await UsuarioModelo.obterPeloUID(req.params.uid)
            if (!usuario) return res.redirect('/usuarios')
            res.render('usuario/mostrar', { usuario })
        } catch (erro) {
            console.error('Erro ao buscar usuário:', erro.message)
            res.redirect('/usuarios')
        }
    },

    async edicaoFormulario(req, res) {
        try {
            const usuario = await UsuarioModelo.obterPeloUID(req.params.uid)
            if (!usuario) return res.redirect('/usuarios')
            res.render('usuario/editar', { usuario })
        } catch (erro) {
            console.error('Erro ao abrir edição:', erro.message)
            res.redirect('/usuarios')
        }
    },

    async atualizar(req, res) {
        try {
            await UsuarioModelo.editar(req.params.uid, req.body)
            res.redirect(`/usuarios/${req.params.uid}`)
        } catch (erro) {
            console.error('Erro ao atualizar usuário:', erro.message)
            res.redirect('/usuarios?erro=' + encodeURIComponent('Não foi possível atualizar o usuário'))
        }
    },

    async remover(req, res) {
        try {
            await UsuarioModelo.remover(req.params.uid)
            res.redirect('/usuarios')
        } catch (erro) {
            console.error('Erro ao remover usuário:', erro.message)
            res.redirect('/usuarios?erro=' + encodeURIComponent('Não foi possível remover: esse usuário tem carrinho ou pedidos'))
        }
    }
}

export default usuarios