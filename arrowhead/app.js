/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 29.
 */

let startupHelper = require('./utils/startupHelper');
// let serviceRegistry = require('./services/arrowhead/serviceRegistry');
// let path = require('path');
let express = require('express');
const app = express()

let options = {}

const fs = require('fs');
let rawdata = fs.readFileSync('./arrowhead/config/arrowhead_config.json');
let config = JSON.parse(rawdata);

// if (startupHelper.getBool(config.arrowhead_input_orchestrator_tls_useKey)) {
//     options = {
//         pfx: [{
//             buf: fs.readFileSync(path.resolve(__dirname, 'certificates', config.arrowhead_input_orchestrator_tls_local_key)),
//             passphrase: config.arrowhead_input_orchestrator_tls_local_pass
//         }],
//         ca: [fs.readFileSync(path.resolve(__dirname, 'certificates', config.serverSSLTrustStore)), config.serverSSLTrustStorePassword],
//         rejectUnauthorized: false,
//         requestCert: config.serverSSLClientAuth === 'need',
//     }
// }

exports.initExpress = async function() {
    startupHelper.validateENV();

    //set the template engine ejs
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    // app.use(bodyParser.json({ limit: '5mb' }));
    // app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));

    app.use((req, res, next) => {
            const err = new Error('Not Found')
            err.status = 404
            res.locals.message = err.message
                // res.locals.error = config.env === 'development' ? err : {}
                // throw Boom.create(404, err)
        })
        // app.use(errorMiddleware())
    console.log('express launched');
}

const orchestrationRequestForm = {
    requesterSystem: {
        systemName: "s4e_c",
        address: "91.161.102.110",
        port: 8885
    },
    requestedService: {
        serviceDefinitionRequirement: "s4e_p",
        interfaceRequirements: [
            "HTTP-INSECURE-JSON"
        ],
        pingProviders: false
    },
    orchestrationFlags: {
        onlyPreferred: false,
        overrideStore: true,
        externalServiceRequest: false,
        enableInterCloud: false,
        enableQoS: false,
        matchmaking: false,
        metadataSearch: false,
        triggerInterCloud: false,
        pingProviders: false
    },
    preferredProviders: [],
    commands: {},
    qosRequirements: {}
}

const authorizationRequestForm = {
    consumerId: 351,
    interfaceIds: "[2]",
    providerIds: "[349]",
    serviceDefinitionIds: "[361]"
}

// exports.start = () => {
//     return initExpress()
//         .then(async() => {
//             const response = await serviceRegistry.echo()
//             console.log(response.green)
//         })
//         .then(async() => {
//             const response = await serviceRegistry.register(serviceRegistryEntry, false)
//             console.log(response)
//         })
// }