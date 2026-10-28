export const ETAPAS = ['Pedido recebido', 'Em preparação', 'Enviado', 'Entregue']
export const PRAZO_DIAS_UTEIS = 5

// Soma dias úteis (pula sábado e domingo)
function somarDiasUteis(data, dias) {
    const d = new Date(data)
    let restantes = dias
    while (restantes > 0) {
        d.setDate(d.getDate() + 1)
        const dia = d.getDay()
        if (dia !== 0 && dia !== 6) restantes--
    }
    return d
}

function inicioDoDia(data) {
    const d = new Date(data)
    d.setHours(0, 0, 0, 0)
    return d
}

function formatar(data) {
    return new Date(data).toLocaleDateString('pt-BR')
}

export function acompanhar(dataPedido, agora = new Date()) {
    const pedido = dataPedido ? new Date(dataPedido) : new Date(agora)
    const previsao = somarDiasUteis(pedido, PRAZO_DIAS_UTEIS)

    const dias = Math.floor((inicioDoDia(agora) - inicioDoDia(pedido)) / 86400000)

    let etapa
    if (inicioDoDia(agora) >= inicioDoDia(previsao)) etapa = 3
    else if (dias < 1) etapa = 0
    else if (dias < 2) etapa = 1
    else etapa = 2

    return {
        previsao: previsao.toISOString(),
        previsaoTexto: formatar(previsao),
        etapa,
        status: ETAPAS[etapa],
        etapas: ETAPAS
    }
}