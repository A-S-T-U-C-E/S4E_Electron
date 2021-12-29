function getBool(val) {
    if (val === undefined) return false;
    return !!(String(val).toLowerCase());
}

exports.validateENV = async function() {
    const fs = require('fs');
    let rawdata = fs.readFileSync('./arrowhead/config/arrowhead_config.json');
    let envConfig = JSON.parse(rawdata);
    document.getElementById("content_serial").style.color = '#00FF00';
    document.getElementById("content_serial").innerHTML += '<br>Starting env validation';
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
            document.getElementById("content_serial").style.color = '#FF0000';
            document.getElementById("content_serial").innerHTML += '<br>ERROR: Missing ' + key + ' from config!';
            missing = true;
        }
    }
    if (missing) {
        document.getElementById("content_serial").innerHTML += '<br>Please fix your configuration and restart the connection';
        throw new Error('erreur');
    } else document.getElementById("content_serial").innerHTML += '<br>configuration validation finished successfully';
}