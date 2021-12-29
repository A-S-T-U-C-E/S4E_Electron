/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 03. 05.
 */

import {config} from '../config/config'
import forge from 'node-forge'
import fs from 'fs'
import path from 'path'

export let serverSSLKeyStorePublicKey = null

// Utility objects for the operation of the system.

const certificate = fs.readFileSync(path.resolve(__dirname, `../certificates/${config.serverSSLKeyStore}`))
//const privateKey = pki.decryptRsaPrivateKey(certificate, config.serverSSLKeyStorePassword)
const p12Der = forge.util.decode64(certificate.toString('base64'))
const p12Asn1 = forge.asn1.fromDer(p12Der)
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.serverSSLKeyStorePassword)

const bag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
  forge.pki.oids.pkcs8ShroudedKeyBag
  ][0];

//console.log(bag)
const publicKey = forge.pki.setRsaPublicKey(bag.key.n, bag.key.e)
const publicKeyPem = forge.pki.publicKeyToPem(publicKey)
//console.log(forge.pki.publicKeyToPem(publicKey))
const lines = publicKeyPem.split('\r\n')
lines.splice(0, 1)
lines.splice(lines.length -2, 2)
serverSSLKeyStorePublicKey = lines.join('') //public key joined into a single line without header

/*
// Private key
const rsaPrivateKey = forge.pki.privateKeyToAsn1(bags.key)
const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey)
const privateKeyPem = forge.pki.privateKeyInfoToPem(privateKeyInfo)
*/

// Service(s) the system want to consume
export const serviceRegistryEntry = {
    address: config.serverAddress,
    authenticationInfo: '',
    port: config.serverPort,
    systemName: config.clientSystemName
}
