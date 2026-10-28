import mssql from 'mssql'
import { conectar } from '../config/db.mjs'


class ProdutoModelo {
    static async garantirTabelaDoApp() {
        await conectar()

        const configuracaoTabela = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Produtos' AND xtype='U')
        BEGIN
            CREATE TABLE Produtos (
                uid UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
                nome VARCHAR(MAX) NOT NULL,
                descricao VARCHAR(MAX),
                categoria VARCHAR(100) NOT NULL,
                marca VARCHAR(100),
                imagem VARCHAR(MAX),
                preco DECIMAL(10,2) NOT NULL,
                quantidade INT NOT NULL,
                dataCadastro DATETIME DEFAULT GETDATE()
            )
        END

        IF NOT EXISTS (
            SELECT * FROM sys.columns
            WHERE object_id = OBJECT_ID('Produtos') AND name = 'imagem'
        )
        BEGIN
            ALTER TABLE Produtos ADD imagem VARCHAR(MAX)
        END
        `

        await mssql.query(configuracaoTabela)
    }

    static async obterTodosOsDados() {
    await this.garantirTabelaDoApp()

    const resultado = await mssql.query(`
        SELECT *
        FROM Produtos
        ORDER BY nome
    `)

    return resultado.recordset
}

    static async buscar(termo) {
    await conectar()

    const requisicao = new mssql.Request()
    requisicao.input('termo', mssql.VarChar(mssql.MAX), `%${termo}%`)

    const resultado = await requisicao.query(`
        SELECT * FROM Produtos
        WHERE nome LIKE @termo
           OR categoria LIKE @termo
           OR marca LIKE @termo
    `)

    return resultado.recordset
}

    static async criarProduto({
    nome,
    descricao,
    categoria,
    marca,
    imagem,
    preco,
    quantidade
}) {
    await this.garantirTabelaDoApp()

    const requisicao = new mssql.Request()

    requisicao.input('nome', mssql.VarChar(mssql.MAX), nome)
    requisicao.input('descricao', mssql.VarChar(mssql.MAX), descricao)
    requisicao.input('categoria', mssql.VarChar(100), categoria)
    requisicao.input('marca', mssql.VarChar(100), marca)
    requisicao.input('imagem', mssql.VarChar(mssql.MAX), imagem || null)
    requisicao.input('preco', mssql.Decimal(10, 2), preco)
    requisicao.input('quantidade', mssql.Int, quantidade)

    const resultado = await requisicao.query(`
        INSERT INTO Produtos
        (nome, descricao, categoria, marca, imagem, preco, quantidade)
        OUTPUT INSERTED.uid
        VALUES
        (@nome, @descricao, @categoria, @marca, @imagem, @preco, @quantidade)
    `)

    const uid = resultado.recordset[0].uid

    return {
        uid,
        nome,
        descricao,
        categoria,
        marca,
        imagem,
        preco: Number(preco),
        quantidade: Number(quantidade)
    }
}
    static async obterPeloUID(uid) {
    await conectar()

    const requisicao = new mssql.Request()

    requisicao.input('uid', mssql.UniqueIdentifier, uid)

    const resultado = await requisicao.query(`
        SELECT * FROM Produtos
        WHERE uid = @uid
    `)

    return resultado.recordset[0]
}

    static async editar(uid, {
    nome,
    descricao,
    categoria,
    marca,
    imagem,
    preco,
    quantidade
}) {
    await conectar()

    const requisicao = new mssql.Request()

    requisicao.input('uid', mssql.UniqueIdentifier, uid)
    requisicao.input('nome', mssql.VarChar(mssql.MAX), nome)
    requisicao.input('descricao', mssql.VarChar(mssql.MAX), descricao)
    requisicao.input('categoria', mssql.VarChar(100), categoria)
    requisicao.input('marca', mssql.VarChar(100), marca)
    requisicao.input('imagem', mssql.VarChar(mssql.MAX), imagem || null)
    requisicao.input('preco', mssql.Decimal(10, 2), preco)
    requisicao.input('quantidade', mssql.Int, quantidade)

    await requisicao.query(`
        UPDATE Produtos
        SET
            nome = @nome,
            descricao = @descricao,
            categoria = @categoria,
            marca = @marca,
            imagem = @imagem,
            preco = @preco,
            quantidade = @quantidade
        WHERE uid = @uid
    `)

    return this.obterPeloUID(uid)
}

    static async remover(uid) {
    await conectar()

    // Remove primeiro qualquer item de pedido antigo (de teste) ligado a este produto,
    // senão o banco bloqueia o DELETE por causa da referência (foreign key)
    const requisicaoItens = new mssql.Request()
    requisicaoItens.input('uid', mssql.UniqueIdentifier, uid)
    await requisicaoItens.query(`
        DELETE FROM ItensPedido WHERE ProdutoUID = @uid
    `)

    const requisicaoProduto = new mssql.Request()
    requisicaoProduto.input('uid', mssql.UniqueIdentifier, uid)
    await requisicaoProduto.query(`
        DELETE FROM Produtos WHERE uid = @uid
    `)
}
}

export default ProdutoModelo