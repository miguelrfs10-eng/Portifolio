import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class CarrinhoModelo {
    static async garantirTabelaDoApp() {
        await conectar()

        const configuracaoTabela = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Carrinho' AND xtype='U')
        BEGIN
            CREATE TABLE Carrinho(
                ID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    ProdutoUID UNIQUEIDENTIFIER NOT NULL,
    Quantidade INT NOT NULL DEFAULT 1,
    DataCadastro DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (UsuarioID) REFERENCES Usuarios(ID),
    FOREIGN KEY (ProdutoUID) REFERENCES Produtos(uid)
            )
        END
        `

        await mssql.query(configuracaoTabela)
    }

    static async obterTodosOsDados() {
        await conectar()

        const resultado = await mssql.query(`
            SELECT
                C.ID,
                C.UsuarioID,
                U.Nome AS Usuario,
                C.ProdutoUID,
                P.nome AS Produto,
                P.preco,
                C.Quantidade,
                (P.preco * C.Quantidade) AS TotalItem,
                C.DataCadastro
            FROM Carrinho C
            INNER JOIN Usuarios U
                ON C.UsuarioID = U.ID
            INNER JOIN Produtos P
                ON C.ProdutoUID = P.uid
            ORDER BY C.ID
        `)

        return resultado.recordset
    }

    static async buscar(termo) {
        await conectar()

        const requisicao = new mssql.Request()

        requisicao.input(
            'termo',
            mssql.VarChar(mssql.MAX),
            `%${termo}%`
        )

        const resultado = await requisicao.query(`
            SELECT
                C.ID,
                U.Nome AS Usuario,
                P.nome AS Produto,
                P.preco,
                C.Quantidade,
                (P.preco * C.Quantidade) AS TotalItem
            FROM Carrinho C
            INNER JOIN Usuarios U
                ON C.UsuarioID = U.ID
            INNER JOIN Produtos P
                ON C.ProdutoUID = P.uid
            WHERE
                U.Nome LIKE @termo
                OR P.nome LIKE @termo
        `)

        return resultado.recordset
    }

    static async criarItem({
        UsuarioID,
        ProdutoUID,
        Quantidade
    }) {
        await conectar()

        const requisicao = new mssql.Request()

        requisicao.input('UsuarioID', mssql.Int, UsuarioID)
        requisicao.input(
            'ProdutoUID',
            mssql.UniqueIdentifier,
            ProdutoUID
        )
        requisicao.input('Quantidade', mssql.Int, Quantidade)

        // Se o produto já está no carrinho desse usuário, soma a quantidade.
        // Se não está, cria uma linha nova.
        const resultado = await requisicao.query(`
            IF EXISTS (
                SELECT 1 FROM Carrinho
                WHERE UsuarioID = @UsuarioID
                  AND ProdutoUID = @ProdutoUID
            )
            BEGIN
                UPDATE TOP (1) Carrinho
                SET Quantidade = Quantidade + @Quantidade
                OUTPUT INSERTED.ID
                WHERE UsuarioID = @UsuarioID
                  AND ProdutoUID = @ProdutoUID
            END
            ELSE
            BEGIN
                INSERT INTO Carrinho
                (
                    UsuarioID,
                    ProdutoUID,
                    Quantidade
                )
                OUTPUT INSERTED.ID
                VALUES
                (
                    @UsuarioID,
                    @ProdutoUID,
                    @Quantidade
                )
            END
        `)

        return {
            ID: resultado.recordset[0].ID,
            UsuarioID,
            ProdutoUID,
            Quantidade
        }
    }

    // Busca um item, mas só se ele for do usuário informado
    static async obterPeloIDDoUsuario(ID, UsuarioID) {
        await conectar()

        const requisicao = new mssql.Request()

        requisicao.input('ID', mssql.Int, ID)
        requisicao.input('UsuarioID', mssql.Int, UsuarioID)

        const resultado = await requisicao.query(`
            SELECT
                C.ID,
                C.ProdutoUID,
                P.nome AS Produto,
                P.preco,
                P.quantidade AS Estoque,
                C.Quantidade,
                (P.preco * C.Quantidade) AS TotalItem
            FROM Carrinho C
            INNER JOIN Produtos P
                ON C.ProdutoUID = P.uid
            WHERE C.ID = @ID
              AND C.UsuarioID = @UsuarioID
        `)

        return resultado.recordset[0]
    }

    // Muda só a quantidade, e só de um item do próprio usuário
    static async atualizarQuantidade(ID, UsuarioID, Quantidade) {
        await conectar()

        const requisicao = new mssql.Request()

        requisicao.input('ID', mssql.Int, ID)
        requisicao.input('UsuarioID', mssql.Int, UsuarioID)
        requisicao.input('Quantidade', mssql.Int, Quantidade)

        await requisicao.query(`
            UPDATE Carrinho
            SET Quantidade = @Quantidade
            WHERE ID = @ID
              AND UsuarioID = @UsuarioID
        `)
    }

    static async remover(ID, UsuarioID) {
        await conectar()

        const requisicao = new mssql.Request()

        requisicao.input('ID', mssql.Int, ID)
        requisicao.input('UsuarioID', mssql.Int, UsuarioID)

        await requisicao.query(`
            DELETE FROM Carrinho
            WHERE ID = @ID
              AND UsuarioID = @UsuarioID
        `)
    }

    static async obterPorUsuario(UsuarioID) {

    await conectar()

    const requisicao = new mssql.Request()

    requisicao.input(
        'UsuarioID',
        mssql.Int,
        UsuarioID
    )

    const resultado = await requisicao.query(`
        SELECT
            C.ID,
            C.UsuarioID,
            U.Nome AS Usuario,
            C.ProdutoUID,
            P.nome AS Produto,
            P.preco,
            C.Quantidade,
            (P.preco * C.Quantidade) AS TotalItem,
            C.DataCadastro

        FROM Carrinho C

        INNER JOIN Usuarios U
            ON C.UsuarioID = U.ID

        INNER JOIN Produtos P
            ON C.ProdutoUID = P.uid

        WHERE C.UsuarioID = @UsuarioID

        ORDER BY C.ID
    `)

    return resultado.recordset
}

}

export default CarrinhoModelo