import PoliticaModelo from '../models/PoliticaModelo.mjs'

const politicaPrivacidade = {

    async index(requisicao, resposta) {
        try {
            const politica = await PoliticaModelo.obterConteudo()
            resposta.render('politica/index', { politica })
        } catch (erro) {
            console.error('Erro ao carregar a página de política:', erro)
            resposta.status(500).send('Erro interno do servidor')
        }
    }

}

export default politicaPrivacidade