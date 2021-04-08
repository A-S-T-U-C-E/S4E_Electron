/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 01. 29.
 */

import './dotenv'
import { getBool } from '../utils/utils'

export const config = {
  env: process.env.NODE_ENV,
  clientSystemName: process.env.CLIENT_SYSTEM_NAME,
  serverAddress: process.env.SERVER_ADDRESS,
  serverPort: process.env.SERVER_PORT,
  srAddress: process.env.SR_ADDRESS,
  srPort: process.env.SR_PORT,
  serverSSLEnabled: getBool(process.env.SERVER_SSL_ENABLED),
  tokenSecurityFilterEnabled: process.env.TOKEN_SECURITY_FILTER_ENABLED,
  serverSSLKeyStoreType: process.env.SERVER_SSL_KEYSTORE_TYPE,
  serverSSLKeyStore: process.env.SERVER_SSL_KEY_STORE,
  serverSSLKeyStorePassword: process.env.SERVER_SSL_KEY_STORE_PASSWORD,
  serverSSLKeyAlias: process.env.SERVER_SSL_KEY_ALIAS,
  serverSSLKeyPassword: process.env.SERVER_SSL_KEY_PASSWORD,
  serverSSLClientAuth: process.env.SERVER_SSL_CLIENT_AUTH,
  serverSSLTrustStoreType: process.env.SERVER_SSL_TRUST_STORE_TYPE,
  serverSSLTrustStore: process.env.SERVER_SSL_TRUST_STORE,
  serverSSLTrustStorePassword: process.env.SERVER_SSL_TRUST_STORE_PASSWORD
}
