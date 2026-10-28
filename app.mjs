import express from "express"
import ejs from "ejs"
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import produtoRotas from './routes/produtos.mjs'
import funcionarioRotas from './routes/funcionario.mjs'
import logarRotas from './routes/logar.mjs'
import usuarioRotas from './routes/usuario.mjs'
import carrinhoRotas from './routes/carrinho.mjs'
import politicaRotas from './routes/Politica.mjs'
import produtoModelo from './models/produtoModelo.mjs'
import apiRotas from './routes/apiroutes.mjs'


const app = express()
const PORTA = process.env.PORT || 3000
app.listen(PORTA, () => {
  console.log(`Servidor está na rede 127.0.0.1:${PORTA}`)
}) 

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', './views')

app.set('layout', 'fragmento/layout')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('./public'))

app.use(session({
  secret: 'troque-esta-chave-por-uma-string-aleatoria-longa',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 } // 30 minutos
}))

app.use((requisicao, resposta, proximo) => {
  resposta.locals.usuarioLogado = requisicao.session?.usuario || null
  proximo()
})

app.use('/produto', produtoRotas)
app.use('/usuarios', usuarioRotas)
app.use('/funcionarios', funcionarioRotas)
app.use('/carrinho', carrinhoRotas)
app.use('/politica', politicaRotas)
app.use('/api', apiRotas)

app.get("/", async (requisicao, resposta) => {
    try {
        const produtos = await produtoModelo.obterTodosOsDados()
        resposta.render('index', { produtos })
    } catch (erro) {
        console.error('Erro ao carregar a home:', erro.message)
        resposta.render('index', { produtos: [] })
    }
})

app.use('/logar', logarRotas)