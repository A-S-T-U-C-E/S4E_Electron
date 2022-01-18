/**
 * @license
 * Copyright 2020 Sébastien CANET
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview Arduino CLI control.
 * @author scanet@libreduc.cc (Sébastien CANET)
 */
let startupHelper = require('./arrowhead/utils/startupHelper');

const rejectHandler = (message) => {
    document.getElementById("compiler-output-text").style.color = '#FF0000';
    document.getElementById("compiler-output-text").innerHTML += '<br>' + message;
    console.log(message);
}

window.addEventListener('load', function load(event) {
    document.getElementById('ArrowheadConfiguration_auto').onclick = async function(event) {
        document.getElementById("compiler-output-text").style.color = '#00FF00';
        document.getElementById("compiler-output-text").innerHTML = '<br>start Arrowhead connect script';
        let systemFound = true;
        let responseFunction = startupHelper.validateENV()
            .then(async() => {
                document.getElementById("compiler-output-text").innerHTML += '<br>ping registry service';
                responseFunction = await echo()
            })
            .then(async() => {
                console.log(responseFunction);
                //specific query for existing consumer -> system
                //else for service it will be on /query
                responseFunction = await query('http://137.204.57.93:8443/serviceregistry/query/system', '{"address": "91.161.102.110","authenticationInfo": "","port": 8999,"systemName": "papyrus_file_consumer"}')
            })
            .catch(
                err => {
                    systemFound = false;
                    rejectHandler(err.message);
                }
            )
            .then(async() => {
                responseFunction = await register('{"address": "91.161.102.110","authenticationInfo": "","port": 8999,"systemName": "papyrus_file_consumer"}', false);
            })
            .catch(
                err => {
                    rejectHandler(err.message);
                }
            )
            .then(async() => {
                responseFunction = await orchestration('{"requesterSystem": {"systemName": "papyrus_file_consumer","address": "91.161.102.110","port": 8999},"requestedService": {"serviceDefinitionRequirement": "file-downloader","interfaceRequirements": ["HTTP-INSECURE-JSON"],"pingProviders": false},"orchestrationFlags": {"onlyPreferred": false,"overrideStore": true,"externalServiceRequest": false,"enableInterCloud": false,"enableQoS": false,"matchmaking": false,"metadataSearch": false,"triggerInterCloud": false,"pingProviders": false},"preferredProviders": [],"commands": {},"qosRequirements": {}}');
                console.log(responseFunction)
            })
            .catch(
                err => {
                    rejectHandler(err.message);
                }
            )
    };
    document.getElementById('papyrusConnect').onclick = async function(event) {
        document.getElementById("compiler-output-text").style.color = '#00FF00';
        document.getElementById("compiler-output-text").innerHTML = '<br>Start Papyrus download file';
        let responseFunction = downloadFileFromPapyrus()
            .then(async() => {
                const { ipcRenderer } = require('electron');
                ipcRenderer.sendSync('launch_with_papyrus_configuration');
            })
            .catch(
                err => {
                    rejectHandler(err.message);
                }
            )
    }
})

/*
  Requesting file from Papyrus, thanks to orchestration
 */
async function downloadFileFromPapyrus() {
    let papyrusURL = "http://" + sessionStorage.getItem("PapyrusProvider") + "/downloadFile/HomeAutomationSystemST4Econfig.json";
    let axios = require('axios');
    return new Promise((resolve, reject) => {
        axios.get(papyrusURL)
            .then(response => {
                if (response.status === 200) {
                    document.getElementById("compiler-output-text").innerHTML += '<br>Successfully downloaded file';
                    let fs = require('fs');
                    fs.writeFileSync('./arrowhead/HomeAutomationSystemST4Econfig.json', JSON.stringify(response.data));
                    return resolve(response)
                }
            })
            .catch(error => {
                console.log('Error during orchestration', error)
                document.getElementById("compiler-output-text").style.color = '#FF0000';
                document.getElementById("compiler-output-text").innerHTML += error;
                return reject(error.response.data.errorMessage)
            })
    })
}
/*
  Requesting orchestration based on the received params
 */
async function orchestration(orchestrationRequestForm) {
    let axios = require('axios');
    let orchestrationURL = 'http://137.204.57.93:8441/orchestrator/orchestration';
    let opts = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }
    console.log('Orchestration starting...')
    return new Promise((resolve, reject) => {
        axios.post(orchestrationURL, orchestrationRequestForm, opts)
            .then(response => {
                if (response.status === 200) {
                    document.getElementById("compiler-output-text").innerHTML += '<br>Successfully launched orchestration';
                    let fs = require('fs');
                    fs.writeFileSync('./arrowhead/orchestrationResponse.txt', JSON.stringify(response));
                    sessionStorage.setItem("PapyrusProvider", response.data.response[0].provider.address + ":" + response.data.response[0].provider.port);
                    return resolve('Successfully launched orchestration', response)
                }
            })
            .catch(error => {
                console.log('Error during orchestration', error)
                document.getElementById("compiler-output-text").style.color = '#FF0000';
                document.getElementById("compiler-output-text").innerHTML += error;
                return reject(error.response.data.errorMessage)
            })
    })
}

async function echo() {
    let axios = require('axios');
    let orchestrationURL = 'http://137.204.57.93:8443/serviceregistry/echo';
    opts = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }
    return new Promise(async(resolve, reject) => {
        let response = null
        const source = axios.CancelToken.source()
        setTimeout(() => {
            if (response === null) {
                console.log('Service Registry is not available...')
                source.cancel('Service Registry is not available...')
            }
        }, 1000)
        response = await axios.get(
                orchestrationURL, { cancelToken: source.token }
            )
            .then(response => {
                console.log('Service Registry is accessible')
                return resolve('Service Registry is accessible')
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    console.log(error.message)
                    return reject(error.message)
                }
                console.log(error)
                return reject(error)
            })
    })
}

async function query(URL, serviceRegistryEntry) {
    let axios = require('axios');
    let opts = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }
    console.log('Querying system')
    return new Promise((resolve, reject) => {
        if (!serviceRegistryEntry) {
            document.getElementById("compiler-output-text").style.color = '#FF0000';
            document.getElementById("compiler-output-text").innerHTML += 'Error during querying, missing Service Definition Requirement';
            return reject('Error during querying, missing Service Definition Requirement')
        }
        axios.post(URL, serviceRegistryEntry, opts)
            .then(response => {
                if (response.status === 200) {
                    document.getElementById("compiler-output-text").innerHTML += '<br>Service already registered into Service Registry';
                    document.getElementById("compiler-output-text").innerHTML += '<br>Id: ' + response.data.id;
                    return resolve(response.data);
                }
            })
            .catch(error => {
                console.log('Error during querying requested service', error)
                document.getElementById("compiler-output-text").style.color = '#FF0000';
                document.getElementById("compiler-output-text").innerHTML += error.response.data.errorMessage;
                return reject(error.response.data.errorMessage)
            })
    })
}

async function register(serviceRegistryEntry, force) {
    let axios = require('axios');
    let orchestrationURL = 'http://137.204.57.93:8443/serviceregistry/mgmt/systems';
    let opts = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(orchestrationURL, serviceRegistryEntry, opts)
            .then((response) => {
                document.getElementById("compiler-output-text").innerHTML += '<br>Successfully registered service into Service Registry';
                document.getElementById("compiler-output-text").innerHTML += '<br>Id: ' + response.data.id;
                return resolve('Successfully registered service into Service Registry', response.data)
            })
            .catch(async error => {
                if (error.response.data.exceptionType === 'INVALID_PARAMETER') {
                    if (force) {
                        unregister(serviceRegistryEntry).then(async() => {
                            await register(serviceRegistryEntry, false)
                            return resolve('Successfully force registered service into Service Registry')
                        })
                    }
                    return resolve('Service is already registered into Service Registry')
                }
                document.getElementById("compiler-output-text").style.color = '#FF0000';
                document.getElementById("compiler-output-text").innerHTML += error;
                return reject(error.response.data.errorMessage)
            })
    })
}

async function unregister(Id) {
    let axios = require('axios');
    let orchestrationURL = 'http://137.204.57.93:8443/serviceregistry/mgmt/systems/' + Id;
    let opts = {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
        }
    }
    return new Promise((resolve, reject) => {
        axios.delete(orchestrationURL, opts)
            .then((response) => {
                if (response.status === 200) {
                    document.getElementById("compiler-output-text").innerHTML += '<br>Successfully unregistered service from Service Registry';
                    document.getElementById("compiler-output-text").innerHTML += '<br>Id: ' + response.data;
                    return resolve(`Successfully unregistered service from Service Registry`)
                }
            })
            .catch(error => {
                document.getElementById("compiler-output-text").style.color = '#FF0000';
                document.getElementById("compiler-output-text").innerHTML += error;
                console.log('Error removing service', error)
                return reject(error.response.data.errorMessage)
            })
    })
}