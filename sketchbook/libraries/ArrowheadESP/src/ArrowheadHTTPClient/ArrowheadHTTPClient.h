//
// Created by Szvetlin Tanyi on 2020. 04. 09.
// Modified by Sébastien Canet on 2021. 10. 12.
//

#ifndef ARROWHEADESP_ARROWHEADHTTPCLIENT_H
#define ARROWHEADESP_ARROWHEADHTTPCLIENT_H

// Library includes
#include <WiFiClient.h>
#include "../Util/Util.h"

class ArrowheadHTTPClient {
private:
    /**
     * SSL capable HTTP client
     */
    WiFiClient _wiFiClient;
public:
    /**
     * Default constructor of the class
     */
    ArrowheadHTTPClient();

    /**
    * Returns the instance of the HTTP client
    *
    * @return
    */
    WiFiClient& getWiFiClient();

    int request(const char* method, const char* host, int port, const char* path, const char* query, const char* body, String* response);
    int readResponse(String* response);

    int get(const char* address, int port, const char* path, const char* query);
    int get(const char* address, int port, const char* path, const char* query, String* response);

    int post(const char* address, int port, const char* path, const char* body);
    int post(const char* address, int port, const char* path, const char* body, String* response);

    int del(const char* address, int port, const char* path, const char* query);
    int del(const char* address, int port, const char* path, const char* query, String* response);

    // TODO patch, put
};

#endif //ARROWHEADESP_ARROWHEADHTTPCLIENT_H