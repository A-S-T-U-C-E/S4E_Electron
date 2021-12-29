/*
 * ArrowheadESP Basic example by Szvetlin Tanyi <szvetlin@aitia.ai>
 * Connects to local network. 
 * Loads SSL certificates, then registers a temperature service in Service Registry.
 *
 */

 #include <ArrowheadESP.h>

ArrowheadESP Arrowhead;

const char* systemName = "securetemperaturesensor"; // name of the system, must match the common name of the certificate
int port = 8080; // doesn't really matter what number we type in, since it won't listen on it anyway
const char* publicKey = "";
String ArrowheadProviderIP = "91.161.102.110";

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Arrowhead.getArrowheadESPFS().loadConfigFile("netConfig.json"); // loads network config from file system
  Arrowhead.getArrowheadESPFS().loadSSLConfigFile("sslConfig.json"); // loads ssl config from file system
  Arrowhead.getArrowheadESPFS().loadProviderConfigFile("providerConfig.json"); // loads provider config from file system
  //Arrowhead.useSecureWebServer(); // call secure configuration if you plan to use secure web server

  // Set the Address and port of the Service Registry.
  Arrowhead.setServiceRegistryAddress(
    Arrowhead.getArrowheadESPFS().getProviderInfo().serviceRegistryAddress,
    Arrowhead.getArrowheadESPFS().getProviderInfo().serviceRegistryPort
  );

  bool startupSuccess = Arrowhead.begin(false); // true of connection to WiFi and loading Certificates is successful
  if(startupSuccess){
    String response = "";
    int statusCode = Arrowhead.serviceRegistryEcho(false, &response);
    Serial.print("Status code from server: ");
    Serial.println(statusCode);
    Serial.print("Response body from server: ");
    Serial.println(response);
    Serial.println("############################");
    Serial.println();

    String serviceRegistryEntry = "{\"endOfValidity\":\"2021-12-05 12:00:00\",\"interfaces\":[\"HTTP-INSECURE-SenML\"],\"providerSystem\":{\"address\":\" "+ ArrowheadProviderIP +"\",\"authenticationInfo\":\""+ publicKey +"\",\"port\":"+ port +",\"systemName\":\""+ systemName +"\"},\"secure\":\"NOT_SECURE\",\"serviceDefinition\":\"dhtesp1\",\"serviceUri\":\"/\",\"version\":1}";  

    response = "";
    statusCode = Arrowhead.serviceRegistryRegister(false, serviceRegistryEntry.c_str(), &response);
    Serial.print("Status code from server: ");
    Serial.println(statusCode);
    Serial.print("Response body from server: ");
    Serial.println(response);
    Serial.println("############################");
    Serial.println();
    }
} 


void loop() {
  Arrowhead.loop(); // keep network connection up
  // put your main code here, to run repeatedly:

  yield();
}