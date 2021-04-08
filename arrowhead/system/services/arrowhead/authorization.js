/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 02. 13.
 */

import networkService from '../network/networkService'
import axios from 'axios'
import { config } from '../../config/config'
import { coreSystemInfo } from '../../utils/startupHelper'

export async function echo() {
  return new Promise(async (resolve, reject) => {
    const authorizationAddress = coreSystemInfo && coreSystemInfo.authorization ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.authorization.address}:${coreSystemInfo.authorization.port}/authorization` : null
    if(!authorizationAddress){
      return reject('No address for Authorization')
    }

    let response = null
    const source = axios.CancelToken.source()

    setTimeout(() => {
      if (response === null) {
        source.cancel('Authorization is not available...')
      }
    }, 1000)


    response = await networkService.get(authorizationAddress + '/echo', {cancelToken: source.token})
      .then(() => {
        return resolve('Authorization is accessible')
      }).catch(error => {
        if (axios.isCancel(error)) {
          return reject(error.message)
        }
        return reject(error)
      })
  })
}

export async function getPublicKey(){
  return new Promise(async (resolve, reject) => {
    const authorizationAddress = coreSystemInfo && coreSystemInfo.authorization ? `${config.serverSSLEnabled ? 'https' : 'http' }://${coreSystemInfo.authorization.address}:${coreSystemInfo.authorization.port}/authorization` : null
      if(!authorizationAddress){
        return reject('No address for Authorization')
    }

    networkService.get(authorizationAddress + '/publickey')
      .then((response) => {
        return resolve(response.data)
      }).catch(error => {
        console.log('Error getting Authorization public key')
        return reject(error.response.data.errorMessage)
      })
  })
}
