function getBool(val) {
    if (val === undefined) return false;
    return !!(String(val).toLowerCase());
}

exports.validateENV = async function() {
    const fs = require('fs');
    let rawdata = fs.readFileSync('./arrowhead/config/arrowhead_config.json');
    let envConfig = JSON.parse(rawdata);
    document.getElementById("compiler-output-text").style.color = '#00FF00';
    document.getElementById("compiler-output-text").innerHTML += '<br>Starting env validation';
    const sslEnabled = getBool(envConfig.arrowhead_input_orchestrator_tls_useKey);

    if (!sslEnabled) {
        envConfig = Object.keys(envConfig)
            .filter(key =>
                !key.includes('SERVER_SSL_', 0) &&
                !key.includes('TOKEN_', 0))
            .reduce((res, key) => (res[key] = envConfig[key], res), {})
    }
    let missing = false;
    for (const key in envConfig) {
        if (!envConfig[key]) {
            document.getElementById("compiler-output-text").style.color = '#FF0000';
            document.getElementById("compiler-output-text").innerHTML += '<br>ERROR: Missing ' + key + ' from config!';
            missing = true;
        }
    }
    if (missing) {
        document.getElementById("compiler-output-text").innerHTML += '<br>Please fix your configuration and restart the connection';
        throw new Error('erreur');
    } else document.getElementById("compiler-output-text").innerHTML += '<br>configuration validation finished successfully';
}