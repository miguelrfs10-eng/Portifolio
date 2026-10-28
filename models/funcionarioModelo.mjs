import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class funcionarioModelo {
    static async obterTodosOsDados() {
        await conectar()
        const resultado = await mssql.query(
            'SELECT id, nomeUsuario, nomeCompleto, cargo, email FROM Funcionario'
        )
        return resultado.recordset
    }

    static async obterPeloID(id) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.Int, id)
        const resultado = await requisicao.query(
            'SELECT id, nomeUsuario, nomeCompleto, cargo, email FROM Funcionario WHERE id = @id'
        )
        return resultado.recordset[0]
    }

    static async criarFuncionario({ nomeUsuario, senha, nomeCompleto, cargo, email }) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('nomeUsuario', mssql.NVarChar(127), nomeUsuario)
        requisicao.input('senha', mssql.NVarChar(255), senha)
        requisicao.input('nomeCompleto', mssql.NVarChar(255), nomeCompleto)
        requisicao.input('cargo', mssql.NVarChar(255), cargo)
        requisicao.input('email', mssql.NVarChar(255), email)
        const resultado = await requisicao.query(
            `INSERT INTO Funcionario (nomeUsuario, senha, nomeCompleto, cargo, email)
            OUTPUT INSERTED.id
            VALUES (@nomeUsuario, @senha, @nomeCompleto, @cargo, @email)`
        )
        return resultado.recordset[0].id
    }

    static async editar(id, { nomeUsuario, nomeCompleto, cargo, email }) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.Int, id)
        requisicao.input('nomeUsuario', mssql.NVarChar(127), nomeUsuario)
        requisicao.input('nomeCompleto', mssql.NVarChar(255), nomeCompleto)
        requisicao.input('cargo', mssql.NVarChar(255), cargo)
        requisicao.input('email', mssql.NVarChar(255), email)
        await requisicao.query(
            'UPDATE Funcionario SET nomeUsuario = @nomeUsuario, nomeCompleto = @nomeCompleto, cargo = @cargo, email = @email WHERE id = @id'
        )
        return this.obterPeloID(id)
    }

    static async remover(id) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('id', mssql.Int, id)
        await requisicao.query('DELETE FROM Funcionario WHERE id = @id')
    }

    static async autenticar(nomeUsuario, senha) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('nomeUsuario', mssql.NVarChar(127), nomeUsuario)
        requisicao.input('senha', mssql.NVarChar(255), senha)
        const resultado = await requisicao.query('EXEC acessar @nomeUsuario, @senha')
        return resultado.recordset[0] || null
    }

    // Login do funcionário usando email + senha, igual o login de cliente
    static async autenticarPorEmail(email, senha) {
        await conectar()
        const requisicao = new mssql.Request()
        requisicao.input('email', mssql.NVarChar(255), email)
        requisicao.input('senha', mssql.NVarChar(255), senha)
        const resultado = await requisicao.query(`
            SELECT id, nomeUsuario, nomeCompleto, cargo, email
            FROM Funcionario
            WHERE email = @email AND senha = @senha
        `)
        return resultado.recordset[0] || null
    }
}

export default funcionarioModelo