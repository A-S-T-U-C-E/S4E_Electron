/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 30.
 */

import axios from 'axios'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { config } from '../../config/config'

let httpsAgent = null
let axiosOptions = {}

if(config.serverSSLEnabled) {
  httpsAgent = new https.Agent({
    rejectUnauthorized: true,
    pfx: fs.readFileSync(path.resolve(__dirname, `../../certificates/${config.serverSSLKeyStore}`)),
    passphrase: config.serverSSLKeyStorePassword
  })

  axiosOptions.httpsAgent = httpsAgent
}

const instance = axios.create(axiosOptions)

export default instance
