import mssql from 'mssql';
const config = {

    user: 'matheusadmin',
    password: 'M12@nvr45px.',
    server: 'projetopi2026.database.windows.net',
    port: 1433,
    database: 'free-sql-db-9956266',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }

}
async function conectar() {
    try {
        await mssql.connect(config);
        //console.log("Conectado com sucesso!")
    } catch (error) {
        console.error(error.message)
    }
}

export { conectar }