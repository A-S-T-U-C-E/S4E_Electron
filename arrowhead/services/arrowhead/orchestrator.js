/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 02. 13.
 */

import networkService from '../network/networkService'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { coreSystemInfo } from '../../utils/startupHelper'
import { config } from '../../config/config'

/*
  Checking the core system's availability
 */
export async function echo(){
  return new Promise( async ( resolve, reject ) => {

    const orchestratorAddress =  coreSystemInfo && coreSystemInfo.orchestrator ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.orchestrator.address}:${coreSystemInfo.orchestrator.port}/orchestrator` : null
    if(!orchestratorAddress){
      return reject('No address for Orchestrator')
    }

    let response = null
    const source = axios.CancelToken.source()

    setTimeout(() => {
      if( response === null ) {
        source.cancel('Orchestrator is not available')
      }
    }, 1000)

    response = await networkService.get(orchestratorAddress + '/echo', {cancelToken: source.token})
      .then(response => {
        return resolve('Orchestrator is accessible')
      }).catch(error => {
        if(axios.isCancel(error)){
          return reject(error.message)
        }
        return reject(error)
      })
  })
}

/*
  Requesting orchestration based on the received params
 */
export async function orchestration(orchestrationRequestForm) {
  //preferredProviders, requestedService, requesterCloud, orchestratorFlags, commands
  console.log('Orchestration starting...')
  return new Promise( (resolve, reject) => {
    const orchestratorAddress =  coreSystemInfo && coreSystemInfo.orchestrator ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.orchestrator.address}:${coreSystemInfo.orchestrator.port}/orchestrator` : null
    if(!orchestratorAddress){
      return reject('No address for Orchestrator')
    }
    if(!orchestrationRequestForm.requestedService) {
      return reject('Error during orchestration, missing Requested Service')
    }
    networkService.post(orchestratorAddress + '/orchestration', orchestrationRequestForm)
      .then(response => {
        if(response.status === 200){
          fs.writeFileSync(path.resolve(__dirname + 'orchestrationResponse.txt'), response)
          return resolve(response.data)
        }
      })
      .catch(error => {
        console.log('Error during orchestration', error)
        return reject(error.response.data.errorMessage)
      })
  })
}

export async function storeOrchestrationById(storeId) {
  console.log('Store Orchestration by ID started')
  return new Promise((resolve, reject) => {
    const orchestratorAddress =  coreSystemInfo && coreSystemInfo.orchestrator ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.orchestrator.address}:${coreSystemInfo.orchestrator.port}/orchestrator` : null
    if(!orchestratorAddress){
      return reject('No address for Orchestrator')
    }
    if(!storeId) {
      return reject('Error during store orchestration by id, missing Store ID')
    }
    networkService.get(orchestratorAddress + `/orchestration/${storeId}`)
      .then(response => {
        if(response.status === 200){
          return resolve(response.data)
        }
      })
      .catch(error => {
        console.log('Error during store orchestration', error)
        return reject(error.response.data.errorMessage)
      })
  })
}