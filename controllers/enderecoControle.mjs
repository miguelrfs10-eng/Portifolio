import EnderecoModelo from '../models/enderecoModelo.mjs'

function limpar(valor) {
    return (valor ?? '').toString().trim()
}

class EnderecoControle {

    // GET /usuarios/endereco — mostra o endereço salvo do cliente
    static async mostrar(requisicao, resposta) {

        const sessao = requisicao.session.usuario

        // Conta de funcionário não tem endereço de entrega
        if (sessao.tipo !== 'cliente') {
            return resposta.render('endereco/index', { endereco: null, soCliente: false, salvo: false })
        }

        try {
            const endereco = await EnderecoModelo.obter(sessao.id)
            resposta.render('endereco/index', {
                endereco,
                soCliente: true,
                salvo: requisicao.query.salvo === '1'
            })
        } catch (erro) {
            console.error(erro)
            resposta.status(500).send('Erro ao carregar seu endereço.')
        }
    }

    // GET /usuarios/endereco/editar — formulário para cadastrar ou editar
    static async editarFormulario(requisicao, resposta) {

        const sessao = requisicao.session.usuario

        if (sessao.tipo !== 'cliente') return resposta.redirect('/usuarios/endereco')

        try {
            const endereco = await EnderecoModelo.obter(sessao.id)
            resposta.render('endereco/editar', { endereco: endereco || {}, erro: null })
        } catch (erro) {
            console.error(erro)
            resposta.status(500).send('Erro ao carregar o formulário de endereço.')
        }
    }

    // POST /usuarios/endereco — valida e salva
    static async salvar(requisicao, resposta) {

        const sessao = requisicao.session.usuario

        if (sessao.tipo !== 'cliente') return resposta.redirect('/usuarios/endereco')

        const dados = {
            rua: limpar(requisicao.body.rua),
            numero: limpar(requisicao.body.numero),
            bairro: limpar(requisicao.body.bairro),
            complemento: limpar(requisicao.body.complemento),
            cidade: limpar(requisicao.body.cidade),
            estado: limpar(requisicao.body.estado).toUpperCase(),
            cep: limpar(requisicao.body.cep)
        }

        let erro = null

        if (!dados.rua || !dados.numero || !dados.bairro || !dados.cidade || !dados.estado || !dados.cep) {
            erro = 'Preencha rua, número, bairro, cidade, estado e CEP.'
        } else if (!/^[A-Z]{2}$/.test(dados.estado)) {
            erro = 'O estado deve ter 2 letras (ex.: SP).'
        } else if (!/^\d{5}-?\d{3}$/.test(dados.cep)) {
            erro = 'O CEP deve ter 8 números (ex.: 06600-000).'
        }

        if (erro) {
            // devolve o formulário com o que a pessoa digitou
            const endereco = {
                Rua: dados.rua, Numero: dados.numero, Bairro: dados.bairro, Complemento: dados.complemento,
                Cidade: dados.cidade, Estado: dados.estado, CEP: dados.cep
            }
            return resposta.status(400).render('endereco/editar', { endereco, erro })
        }

        // guarda o CEP no formato 00000-000
        dados.cep = dados.cep.replace(/^(\d{5})-?(\d{3})$/, '$1-$2')

        try {
            await EnderecoModelo.salvar(sessao.id, dados)
            resposta.redirect('/usuarios/endereco?salvo=1')
        } catch (erroBanco) {
            console.error(erroBanco)
            resposta.status(500).send('Erro ao salvar o endereço.')
        }
    }
}

export default EnderecoControle