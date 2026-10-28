document.addEventListener('DOMContentLoaded', () => {
    const controlarItens = document.getElementById('itens-pedidos');
    const botaoAdicionar = document.getElementById('adicionar-item-pedido');
    const templateItem = document.getElementById('item-pedido-template')
    if (!controlarItens || !botaoAdicionar || !templateItem) return
    const adicionarItem = () => {
        const clonar = templateItem.content.cloneNode(true)
        const blocoItem = clonar.querySelector('.item-pedido')
        const botaoRemover = clonar.querySelector('.remover-item-pedido')

        botaoRemover.addEventListener('click', () => { blocoItem.remove() })
        controlarItens.appendChild(clonar)
    }
    botaoAdicionar.addEventListener('click', adicionarItem)
    adicionarItem()
})

// Seletor − / + dos formulários de produto (preço e estoque)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stepper-produto').forEach(stepper => {
        const campo = stepper.querySelector('input')
        const botaoMenos = stepper.querySelector('.stepper-menos')
        const botaoMais = stepper.querySelector('.stepper-mais')
        const passo = Number(stepper.dataset.passo) || 1
        const minimo = campo.min !== '' ? Number(campo.min) : 0

        const alterar = (direcao) => {
            const atual = parseFloat(campo.value) || 0
            let novo = Math.round((atual + direcao * passo) * 100) / 100
            if (novo < minimo) novo = minimo
            campo.value = novo
        }

        botaoMenos.addEventListener('click', () => alterar(-1))
        botaoMais.addEventListener('click', () => alterar(1))
    })
})