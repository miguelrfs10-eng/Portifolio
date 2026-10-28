import express from 'express'
import politicaPrivacidade from '../controllers/PoliticaControle.mjs'

const rota = express.Router()

rota.get('/', politicaPrivacidade.index)

export default rota