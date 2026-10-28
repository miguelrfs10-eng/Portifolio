import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class UsuarioModelo {

    static async garantirTabela() {
        await conectar()
        const resultadoUsuario = await mssql.query(`SELECT id, Nome, Email, Telefone FROM Usuarios`)
        return resultadoUsuario.recordset

    }

    static async obterTodosOsDados() {
        await this.garantirTabela()
        const resultado = await mssql.query('SELECT id, nome, email, telefone, dataCadastro FROM Usuarios ORDER BY nome')
        return resultado.recordset
    }

    static async obterPeloUID(id) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.INT, id)
        const resultado = await requisicao.query('SELECT id, nome, email, telefone, dataCadastro FROM Usuarios WHERE id = @id')
        return resultado.recordset[0]
    }

    static async criarUsuario({ nome, email, senha, telefone }) {
        await this.garantirTabela()
        const requisicao = new mssql.Request()
        requisicao.input('nome', mssql.NVarChar(100), nome)
        requisicao.input('email', mssql.NVarChar(255), email)
        requisicao.input('senha', mssql.NVarChar(255), senha || null)
        requisicao.input('telefone', mssql.NVarChar(20), telefone || null)
        const resultado = await requisicao.query(`
            INSERT INTO Usuarios (nome, email, senha, telefone)
            OUTPUT INSERTED.id
            VALUES (@nome, @email, @senha, @telefone)
        `)
        return resultado.recordset[0].id
    }

    static async autenticar(email, senha) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('email', mssql.NVarChar(255), email)
        requisicao.input('senha', mssql.NVarChar(255), senha)
        const resultado = await requisicao.query(`
            SELECT id, nome, email, telefone
            FROM Usuarios
            WHERE email = @email AND senha = @senha
        `)
        return resultado.recordset[0] || null
    }

    static async editar(id, { nome, email, telefone }) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.Int, id)
        requisicao.input('nome', mssql.NVarChar(100), nome)
        requisicao.input('email', mssql.NVarChar(255), email)
        requisicao.input('telefone', mssql.NVarChar(20), telefone || null)
        await requisicao.query(`
            UPDATE Usuarios SET
                nome     = @nome,
                email    = @email,
                telefone = @telefone
            WHERE id = @id
        `)
        return this.obterPeloUID(id)
    }

    static async remover(id) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.Int, id)
        await requisicao.query('DELETE FROM Usuarios WHERE id = @id')
    }
}

export default UsuarioModelo