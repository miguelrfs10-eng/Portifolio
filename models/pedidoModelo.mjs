import mssql from 'mssql'
import { conectar } from '../config/db.mjs'

class PedidoModelo {

    static async garantirTabelas() {

        await conectar()

        await mssql.query(`
            IF NOT EXISTS (
                SELECT *
                FROM sysobjects
                WHERE name = 'Pedidos'
                AND xtype = 'U'
            )
            BEGIN
                CREATE TABLE Pedidos (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    UsuarioID INT NOT NULL,
                    Nome VARCHAR(200) NOT NULL,
                    Endereco VARCHAR(300) NOT NULL,
                    Cidade VARCHAR(100) NOT NULL,
                    Estado VARCHAR(2) NOT NULL,
                    CEP VARCHAR(20) NOT NULL,
                    Pagamento VARCHAR(50) NOT NULL,
                    Total DECIMAL(10,2) NOT NULL,
                    DataPedido DATETIME DEFAULT GETDATE(),

                    FOREIGN KEY (UsuarioID)
                    REFERENCES Usuarios(ID)
                )
            END
        `)

        await mssql.query(`
            IF NOT EXISTS (
                SELECT *
                FROM sysobjects
                WHERE name = 'ItensPedido'
                AND xtype = 'U'
            )
            BEGIN
                CREATE TABLE ItensPedido (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    PedidoID INT NOT NULL,
                    ProdutoUID UNIQUEIDENTIFIER NOT NULL,
                    Produto VARCHAR(200) NOT NULL,
                    Preco DECIMAL(10,2) NOT NULL,
                    Quantidade INT NOT NULL,
                    TotalItem DECIMAL(10,2) NOT NULL,

                    FOREIGN KEY (PedidoID)
                    REFERENCES Pedidos(ID),

                    FOREIGN KEY (ProdutoUID)
                    REFERENCES Produtos(uid)
                )
            END
        `)
    }


    static async criarPedido({
        UsuarioID,
        Nome,
        Endereco,
        Cidade,
        Estado,
        CEP,
        Pagamento,
        lista
    }) {

        await conectar()

        const transacao = new mssql.Transaction()

        try {

            await transacao.begin()

            let total = 0

            for (const item of lista) {
                total += Number(item.TotalItem)
            }

            const requisicaoPedido =
                new mssql.Request(transacao)

            requisicaoPedido.input(
                'UsuarioID',
                mssql.Int,
                UsuarioID
            )

            requisicaoPedido.input(
                'Nome',
                mssql.VarChar(200),
                Nome
            )

            requisicaoPedido.input(
                'Endereco',
                mssql.VarChar(300),
                Endereco
            )

            requisicaoPedido.input(
                'Cidade',
                mssql.VarChar(100),
                Cidade
            )

            requisicaoPedido.input(
                'Estado',
                mssql.VarChar(2),
                Estado
            )

            requisicaoPedido.input(
                'CEP',
                mssql.VarChar(20),
                CEP
            )

            requisicaoPedido.input(
                'Pagamento',
                mssql.VarChar(50),
                Pagamento
            )

            requisicaoPedido.input(
                'Total',
                mssql.Decimal(10, 2),
                total
            )

            const resultadoPedido =
                await requisicaoPedido.query(`
                    INSERT INTO Pedidos
                    (
                        UsuarioID,
                        Nome,
                        Endereco,
                        Cidade,
                        Estado,
                        CEP,
                        Pagamento,
                        Total
                    )
                    OUTPUT INSERTED.ID
                    VALUES
                    (
                        @UsuarioID,
                        @Nome,
                        @Endereco,
                        @Cidade,
                        @Estado,
                        @CEP,
                        @Pagamento,
                        @Total
                    )
                `)

            const PedidoID =
                resultadoPedido.recordset[0].ID


            for (const item of lista) {

                const requisicaoItem =
                    new mssql.Request(transacao)

                requisicaoItem.input(
                    'PedidoID',
                    mssql.Int,
                    PedidoID
                )

                requisicaoItem.input(
                    'ProdutoUID',
                    mssql.UniqueIdentifier,
                    item.ProdutoUID
                )

                requisicaoItem.input(
                    'Produto',
                    mssql.VarChar(200),
                    item.Produto
                )

                requisicaoItem.input(
                    'Preco',
                    mssql.Decimal(10, 2),
                    Number(item.preco)
                )

                requisicaoItem.input(
                    'Quantidade',
                    mssql.Int,
                    Number(item.Quantidade)
                )

                requisicaoItem.input(
                    'TotalItem',
                    mssql.Decimal(10, 2),
                    Number(item.TotalItem)
                )

                await requisicaoItem.query(`
                    INSERT INTO ItensPedido
                    (
                        PedidoID,
                        ProdutoUID,
                        Produto,
                        Preco,
                        Quantidade,
                        TotalItem
                    )
                    VALUES
                    (
                        @PedidoID,
                        @ProdutoUID,
                        @Produto,
                        @Preco,
                        @Quantidade,
                        @TotalItem
                    )
                `)
            }


            const requisicaoLimparCarrinho =
                new mssql.Request(transacao)

            requisicaoLimparCarrinho.input(
                'UsuarioID',
                mssql.Int,
                UsuarioID
            )

            await requisicaoLimparCarrinho.query(`
                DELETE FROM Carrinho
                WHERE UsuarioID = @UsuarioID
            `)


            await transacao.commit()

            return {
                PedidoID,
                Total: total
            }

        } catch (erro) {

            await transacao.rollback()

            throw erro
        }
    }

    
    // Lista os pedidos de um usuário, cada um com seus itens
    static async listarPorUsuario(UsuarioID) {

        await conectar()
        await this.garantirTabelas()

        const reqPedidos = new mssql.Request()
        reqPedidos.input('UsuarioID', mssql.Int, UsuarioID)

        const pedidos = (await reqPedidos.query(`
            SELECT ID, Nome, Endereco, Cidade, Estado, CEP, Pagamento, Total, DataPedido
            FROM Pedidos
            WHERE UsuarioID = @UsuarioID
            ORDER BY DataPedido DESC, ID DESC
        `)).recordset

        if (pedidos.length === 0) return []

        const reqItens = new mssql.Request()
        reqItens.input('UsuarioID', mssql.Int, UsuarioID)

        const itens = (await reqItens.query(`
            SELECT i.PedidoID, i.ProdutoUID, i.Produto, i.Preco, i.Quantidade, i.TotalItem
            FROM ItensPedido i
            INNER JOIN Pedidos p ON p.ID = i.PedidoID
            WHERE p.UsuarioID = @UsuarioID
            ORDER BY i.ID
        `)).recordset

        return pedidos.map(pedido => ({
            ...pedido,
            itens: itens.filter(item => item.PedidoID === pedido.ID)
        }))
    }
}

export default PedidoModelo