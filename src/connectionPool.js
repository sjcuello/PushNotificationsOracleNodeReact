var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

function createPool() {
    const pool =  oracledb.createPool({
        user          : dbConfig.user,
        password      : dbConfig.password,
        connectString : dbConfig.connectString,
        poolMin:10 ,      /* Numero de conexiones iniciales */
        poolMax: 100,     /* Numero maximo de conexiones */
        poolIncrement: 1, /* Numero de conexiones que se liberan por peticion */
        poolTimeout: 1    /* Tiempo en el cual las conexiones en desuso son finalizadas */
        
    });
    	oracledb.stmtCacheSize = 3000;
 	oracledb.autoCommit = true;
	oracledb.fetchAsString = [ oracledb.CLOB ];	
    return pool;
};

module.exports.createPool = createPool;

function poolGetConnection() {
    
    const pool = createPool();
    return pool.getConnection();
}

module.exports.poolGetConnection = poolGetConnection;
