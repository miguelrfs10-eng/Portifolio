import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class PoliticaModelo{

    static async obterConteudo() {
    await conectar()

    const resultado = await mssql.query(`
        SELECT *
        FROM PoliticaPrivacidade
        ORDER BY OrdemExibicao
    `)

    return resultado.recordset[0]
}

}

export default PoliticaModelo