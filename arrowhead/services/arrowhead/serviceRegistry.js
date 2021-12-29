/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 30.
 */

let networkService = require('../network/networkService');
let axios = require('axios');

const fs = require('fs');
let rawdata = fs.readFileSync('./arrowhead/config/arrowhead_config.json');
let config = JSON.parse(rawdata);
const serviceRegistryAddress = `${config.arrowhead_input_orchestrator_tls_useKey ? 'https' : 'http'}://${config.arrowhead_input_serviceregistry_host}:${config.arrowhead_input_serviceregistry_port}/serviceregistry`

/*
Checking the core system's availability
 */
exports.echo = function() {
    console.log(serviceRegistryAddress);
    return new Promise(async(resolve, reject) => {
        let response = null
        const source = axios.CancelToken.source()
        setTimeout(() => {
            if (response === null) {
                source.cancel('Service Registry is not available...')
            }
        }, 2000)
        response = await networkService.get(serviceRegistryAddress + '/echo', {
                cancelToken: source.token
            })
            .then(response => {
                return resolve('Service Registry is accessible')
            }).catch(error => {
                if (axios.isCancel(error)) {
                    return reject(error.message)
                }
                return reject(error)
            })
    })
}

/*
Registering the System with its service into the Service Registry
 */
exports.register = async function(serviceRegistryEntry, force) {
    return new Promise((resolve, reject) => {
        networkService.post(serviceRegistryAddress + '/mgmt/systems', serviceRegistryEntry)
            .then((response) => {
                console.log(response.data);
                return resolve('Successfully registered service into Service Registry', response.data)
            })
            .catch(async error => {
                if (error.response.data.exceptionType === 'INVALID_PARAMETER') {
                    if (force) {
                        unregister(serviceRegistryEntry.serviceDefinition).then(async() => {
                            await register(serviceRegistryEntry, false)
                            return resolve('Successfully force registered service into Service Registry')
                        })
                    }
                    return resolve('Service is already registered into Service Registry')
                }
                return reject(error.response.data.errorMessage)
            })
    })
}

/*
Unregistering the System from the Service Registry
 */
exports.unregister = function(serviceDefinition) {
    console.log('Removing service from Service Registry...')
    const queryParams = {
        system_name: config.arrowhead_input_orchestrator_consum_name,
        address: config.arrowhead_input_serviceregistry_host,
        port: config.arrowhead_input_serviceregistry_port,
        service_definition: serviceDefinition
    }
    return new Promise((resolve, reject) => {
        networkService.delete(serviceRegistryAddress + '/unregister', {
                params: queryParams
            })
            .then((response) => {
                if (response.status === 200) {
                    return resolve(`Successfully removed ${config.arrowhead_input_orchestrator_consum_name} with Temperature service from SR`)
                }
            })
            .catch(error => {
                console.log('Error removing service', error)
                return reject(error.response.data.errorMessage)
            })
    })
}

/*
Return Registry data that fits the specification
useful to get back Id's and prepare orchestration
 */
exports.query = function(serviceQueryForm) {
    console.log('Querying system')
    return new Promise((resolve, reject) => {
        if (!serviceQueryForm.serviceDefinitionRequirement) {
            return reject('Error during querying, missing Service Definition Requirement')
        }
        networkService.post(serviceRegistryAddress + '/query', serviceQueryForm)
            .then(response => {
                if (response.status === 200) {
                    return resolve(response.data)
                }
            })
            .catch(error => {
                console.log('Error during querying requested service', error)
                return reject(error.response.data.errorMessage)
            })
    })
}

/*
Return requested service registry entries by service definition based on the given parameters
 */
exports.servicedef = function(serviceDefinition) {
    console.log("Retrieving service's id")
    return new Promise((resolve, reject) => {
        networkService.get(serviceRegistryAddress + '/register', serviceDefinition)
            .then((response) => {
                console.log(response.data);
                return resolve('Successfully retrieved registered service into Service Registry', response.data)
            })
            .catch(async error => {
                console.log('Error during retrieving requested service', error)
                return reject(error.response.data.errorMessage)
            })
    })
}