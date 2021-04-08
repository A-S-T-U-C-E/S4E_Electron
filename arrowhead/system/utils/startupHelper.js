/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 02. 04.
 */
import colors from 'colors'
import { dotenvConfig } from '../config/dotenv'
import fs from 'fs'
import { getBool } from './utils'
import { echo, query } from '../services/arrowhead/serviceRegistry'
import path from 'path'

export let coreSystemInfo = null
const coreSystemInfoFilePath = path.resolve(__dirname, '..', 'coreSystemInfo.json')

export function validateENV() {
  console.log('Starting .env validation')

  let config = dotenvConfig.parsed
  const sslEnabled = getBool(config.SERVER_SSL_ENABLED)

  if(!sslEnabled){
    config = Object.keys(config)
      .filter(key =>
        !key.includes('SERVER_SSL_', 0) &&
        !key.includes('TOKEN_', 0))
      .reduce( (res, key) => (res[key] = config[key], res), {} )
  }

  let missing = false

  for(const key in config){
    if(!config[key]){
      console.log(`ERROR: Missing ${key} from .env!`.red)
      missing = true
    }
  }

  if(missing){
    console.log('Please fix your .env and restart the application\nNow exiting...')
    process.exit()
  }

  console.log('.env validation finished successfully'.green)
}

export async function createCoreSystemInfoFile(){
  // Query the Service Registry for the Core System Data
  //Payloads
  const authServiceQueryForm = {
    serviceDefinitionRequirement: "auth-public-key"
  }
  const orchServiceQueryForm = {
    serviceDefinitionRequirement: "orchestration-service"
  }
  const eventHandlerServiceQueryForm = {
    serviceDefinitionRequirement: "event-subscribe"
  }


  // Get data for Auth (mandatory core system)
  const authData = await query(authServiceQueryForm)

  // Get data for Orchestrator (mandatory core system)
  const orchData = await query(orchServiceQueryForm)

  // Get data for Event Handler (supporting core system)
  const ehData = await query(eventHandlerServiceQueryForm)


  coreSystemInfo = {
    "authorization": authData.serviceQueryData.length ? authData.serviceQueryData[0].provider : null,
    "orchestrator": orchData.serviceQueryData.length ? orchData.serviceQueryData[0].provider : null,
    "eventhandler": ehData.serviceQueryData.length ? ehData.serviceQueryData[0].provider : null
  }

  // Add here logic for other supporting core systems query you wish to use.

  // Saving file to JSON
  fs.writeFileSync(coreSystemInfoFilePath, JSON.stringify(coreSystemInfo, null, 4))
}

export async function readCoreSystemInfoFile(foreRecheckCoreSystems = false){
  if(foreRecheckCoreSystems){
    console.log('Core System Info force recheck active')
    try {
      fs.unlinkSync(coreSystemInfoFilePath)
    } catch (error) {
      // ENOENT error ignored
    }
  }
  if(!fs.existsSync(coreSystemInfoFilePath)){
    await createCoreSystemInfoFile().then(() => console.log('New Core System Info file created'))
  }else{
    coreSystemInfo = JSON.parse(fs.readFileSync(coreSystemInfoFilePath))
    console.log('Core System Info file loaded successfully.'.green)
  }
}
