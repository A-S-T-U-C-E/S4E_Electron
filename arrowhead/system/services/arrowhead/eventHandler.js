/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 02. 13.
 */

import networkService from '../network/networkService'
import axios from 'axios'
import { config } from '../config/config'
import { coreSystemInfo } from '../../utils/startupHelper'

export async function echo() {
  return new Promise(async (resolve, reject) => {
    const eventHandlerAddress = coreSystemInfo && coreSystemInfo.eventhandler ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.eventhandler.address}:${coreSystemInfo.eventhandler.port}/eventhandler` : null
    if(!eventHandlerAddress){
      return reject('No address for Event Handler')
    }

    let response = null
    const source = axios.CancelToken.source()

    setTimeout(() => {
      if (response === null) {
        source.cancel('Event Handler is not available...')
      }
    }, 1000)


    response = await networkService.get(eventHandlerAddress + '/echo', {cancelToken: source.token})
      .then(() => {
        return resolve('Event Handler is accessible')
      }).catch(error => {
        if (axios.isCancel(error)) {
          return reject(error.message)
        }
        return reject(error)
      })
  })
}

export async function publish(publishRequest) {
  console.log('Event Publish started...')
  return new Promise((resolve, reject) => {
    const eventHandlerAddress = coreSystemInfo && coreSystemInfo.eventhandler ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.eventhandler.address}:${coreSystemInfo.eventhandler.port}/eventhandler` : null
    if(!eventHandlerAddress){
      return reject('No address for Event Handler')
    }

    if(!publishRequest.eventType){
      return reject('Error during event publish, missing event type!')
    }
    if(!publishRequest.payload) {
      return reject('Error during event publish, missing payload!')
    }
    if(!publishRequest.source){
      return reject('Error during event publish, missing source!')
    }
    if(!publishRequest.timestamp){
      return reject('Error during event publish, missing timestamp!')
    }

    networkService.post(eventHandlerAddress + '/publish', publishRequest)
      .then(response => {
        if(response.status === 200) {
          return resolve(response.data)
        }
      })
      .catch(error => {
        console.log('Error during event publish', error)
        return reject(error.response.data.errorMessage)
      })
  })
}

export async function subscibe(subscriptionRequest){
  console.log('Event subscribe started...')
  return new Promise((resolve, reject) => {
    const eventHandlerAddress = coreSystemInfo && coreSystemInfo.eventhandler ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.eventhandler.address}:${coreSystemInfo.eventhandler.port}/eventhandler` : null
    if(!eventHandlerAddress){
      return reject('No address for Event Handler')
    }

    if(!subscriptionRequest.eventType){
      return reject('Error during event subscribe, missing event type!')
    }
    if(!subscriptionRequest.matchMetadata) {
      return reject('Error during event subscribe, missing match metadata!')
    }
    if(!subscriptionRequest.notifyUri){
      return reject('Error during event subscribe, missing notify URI!')
    }
    if(!subscriptionRequest.subscriberSystem){
      return reject('Error during event subscribe, missing subscriber system!')
    }

    networkService.post(eventHandlerAddress + '/subscribe', subscriptionRequest)
      .then(response => {
        if(response.status === 200) {
          return resolve(response.data)
        }
      })
      .catch(error => {
        console.log('Error during event subscribe', error)
        return reject(error.response.data.errorMessage)
      })
  })
}

export async function unsubscribe(eventType){
  console.log('Event unsubscribe started')
  return new Promise((resolve, reject) => {
    const eventHandlerAddress = coreSystemInfo && coreSystemInfo.eventhandler ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.eventhandler.address}:${coreSystemInfo.eventhandler.port}/eventhandler` : null
    if(!eventHandlerAddress){
      return reject('No address for Event Handler')
    }

    if(!eventType){
      return reject('Error during event subscribe, missing event type!')
    }

    const queryParams = {
      system_name: config.clientSystemName,
      address: config.address,
      port: config.serverPort,
      event_type: eventType
    }

    networkService.delete(eventHandlerAddress + '/unsubscribe', { params: queryParams})
      .then(response => {
        if(response.status === 200){
          return resolve(`Successfully unsubscribed from ${eventType} event!`)
        }
      })
      .catch(error => {
        console.log(`Error during unsubscribe from ${eventType} event`)
        return reject(error.response.data.errorMessage)
      })

  })
}
