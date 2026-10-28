import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class EnderecoModelo {

    // Cria a tabela do endereço do cliente se ainda não existir (um endereço por cliente)
    static async garantirTabela() {

        await conectar()

        await mssql.query(`
            IF NOT EXISTS (
                SELECT *
                FROM sysobjects
                WHERE name = 'EnderecosCliente'
                AND xtype = 'U'
            )
            BEGIN
                CREATE TABLE EnderecosCliente (
                    UsuarioID INT PRIMARY KEY,
                    Rua NVARCHAR(200) NOT NULL,
                    Numero NVARCHAR(20) NOT NULL,
                    Bairro NVARCHAR(100) NOT NULL,
                    Complemento NVARCHAR(100) NULL,
                    Cidade NVARCHAR(100) NOT NULL,
                    Estado NVARCHAR(2) NOT NULL,
                    CEP NVARCHAR(20) NOT NULL,
                    DataAtualizacao DATETIME DEFAULT GETDATE()
                )
            END
        `)
    }

    // Devolve o endereço salvo do cliente (ou null se ele ainda não cadastrou)
    static async obter(usuarioID) {

        await this.garantirTabela()

        const requisicao = new mssql.Request()
        requisicao.input('usuarioID', mssql.Int, usuarioID)

        const resultado = await requisicao.query(`
            SELECT UsuarioID, Rua, Numero, Bairro, Complemento, Cidade, Estado, CEP
            FROM EnderecosCliente
            WHERE UsuarioID = @usuarioID
        `)

        return resultado.recordset[0] || null
    }

    // Cadastra o endereço (primeira vez) ou atualiza o que já existe
    static async salvar(usuarioID, { rua, numero, bairro, complemento, cidade, estado, cep }) {

        await this.garantirTabela()

        const requisicao = new mssql.Request()
        requisicao.input('usuarioID', mssql.Int, usuarioID)
        requisicao.input('rua', mssql.NVarChar(200), rua)
        requisicao.input('numero', mssql.NVarChar(20), numero)
        requisicao.input('bairro', mssql.NVarChar(100), bairro)
        requisicao.input('complemento', mssql.NVarChar(100), complemento || null)
        requisicao.input('cidade', mssql.NVarChar(100), cidade)
        requisicao.input('estado', mssql.NVarChar(2), estado)
        requisicao.input('cep', mssql.NVarChar(20), cep)

        await requisicao.query(`
            IF EXISTS (SELECT 1 FROM EnderecosCliente WHERE UsuarioID = @usuarioID)
                UPDATE EnderecosCliente
                SET Rua = @rua,
                    Numero = @numero,
                    Bairro = @bairro,
                    Complemento = @complemento,
                    Cidade = @cidade,
                    Estado = @estado,
                    CEP = @cep,
                    DataAtualizacao = GETDATE()
                WHERE UsuarioID = @usuarioID
            ELSE
                INSERT INTO EnderecosCliente
                    (UsuarioID, Rua, Numero, Bairro, Complemento, Cidade, Estado, CEP)
                VALUES
                    (@usuarioID, @rua, @numero, @bairro, @complemento, @cidade, @estado, @cep)
        `)
    }
}

export default EnderecoModelo