/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 30.
 */

let axios = require('axios');
let https = require('https');
let fs = require('fs');
let path = require('path');

let httpsAgent = null;
let axiosOptions = {};

let rawdata = fs.readFileSync('./arrowhead/config/arrowhead_config.json');
let config = JSON.parse(rawdata);

// perform custom security feature
if (config.arrowhead_input_orchestrator_tls_useKey) {
    httpsAgent = new https.Agent({
        rejectUnauthorized: true,
        pfx: fs.readFileSync(path.resolve(__dirname, `../../certificates/truststore.p12`)),
        passphrase: config.arrowhead_input_orchestrator_tls_local_pass
    })
    axiosOptions.httpsAgent = httpsAgent;
}

const instance = axios.create(axiosOptions);

module.exports = instance;