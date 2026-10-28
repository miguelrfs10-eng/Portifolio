// Exige que o usuário esteja logado (cliente ou admin)
function garantirEntradaNaRota(requisicao, resposta, proximo) {

    // Usuário logado: segue para a página
    if (requisicao.session?.usuario) return proximo()

    // Não logado: manda para o login
    return resposta.redirect('/logar/login')
}

// Exige que o usuário seja administrador
function somenteAdmin(requisicao, resposta, proximo) {

    const usuario = requisicao.session?.usuario

    // Não logado: manda para o login
    if (!usuario) return resposta.redirect('/logar/login')

    // Logado como admin: segue para a página
    if (usuario.tipo === 'admin') return proximo()

    // Logado, mas é cliente: acesso negado
    return resposta.status(403).render('acesso-negado')
}

// Exige que o usuário seja cliente (funcionário administra a loja, mas não faz compras)
function somenteCliente(requisicao, resposta, proximo) {

    const usuario = requisicao.session?.usuario

    // Não logado: manda para o login
    if (!usuario) return resposta.redirect('/logar/login')

    // Logado como cliente: segue para a página
    if (usuario.tipo === 'cliente') return proximo()

    // Logado como funcionário: mostra o aviso
    return resposta.status(403).render('somente-cliente')
}

export { garantirEntradaNaRota, somenteAdmin, somenteCliente }