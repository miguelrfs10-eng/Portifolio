import UsuarioModelo from "../models/usuarioModelo.mjs";
import funcionarioModelo from "../models/funcionarioModelo.mjs";

const logarControle = {
    async processarLogin(requisicao, resposta) {
        const { email, senha } = requisicao.body
        if (!email || !senha) return resposta.status(400).render('logar/login', { erro: 'informe email e senha' })

        // Primeiro tenta como cliente
        const usuario = await UsuarioModelo.autenticar(email, senha)
        if (usuario !== null) {
            requisicao.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: 'cliente',
                provider: 'local',
            }
            return requisicao.session.save(() => resposta.redirect('/'))
        }

        // Se não é cliente, tenta como funcionário/admin
        const funcionario = await funcionarioModelo.autenticarPorEmail(email, senha)
        if (funcionario !== null) {
            requisicao.session.usuario = {
                id: funcionario.id,
                nome: funcionario.nomeCompleto,
                email: funcionario.email,
                tipo: 'admin',
                provider: 'local',
            }
            return requisicao.session.save(() => resposta.redirect('/'))
        }

        return resposta.status(401).render('logar/login', { erro: 'credenciais incorretas' })
    },
    async logout(requisicao, resposta) {
        return requisicao.session.destroy(erro => {
            if (erro) return resposta.status(500).send('Erro ao fechar a sessão')
            resposta.clearCookie('connect.sid')
            return resposta.redirect('/')
        })
    },
    async login(requisicao, resposta) {
        if (requisicao.session?.usuario) return resposta.redirect('/')
        return resposta.render('logar/login', { erro: null, sucesso: null })
    },
    async cadastroFormulario(requisicao, resposta) {
        return resposta.render('logar/cadastro', { erro: null })
    },
    async processarCadastro(requisicao, resposta) {
        const { nome, email, telefone, senha, confirmarSenha } = requisicao.body

        if (!nome || !email || !senha) {
            return resposta.status(400).render('logar/cadastro', { erro: 'preencha nome, email e senha' })
        }
        if (senha !== confirmarSenha) {
            return resposta.status(400).render('logar/cadastro', { erro: 'as senhas não coincidem' })
        }
        if (senha.length < 6) {
            return resposta.status(400).render('logar/cadastro', { erro: 'a senha precisa ter pelo menos 6 caracteres' })
        }

        try {
            await UsuarioModelo.criarUsuario({ nome, email, senha, telefone })
            return resposta.redirect('/logar/login')
        } catch (erro) {
            console.error('Erro ao cadastrar usuário:', erro.message)
            return resposta.status(500).render('logar/cadastro', { erro: 'não foi possível concluir o cadastro' })
        }
    },
}

export default logarControle