/**
 * @description Controller class for interacting with the connected Gearset Archive.
 *              Provides methods to proxy HTTP requests through the named credential.
 */
public with sharing class GearsetArchiveViewerController {
    /**
     * @description Proxies a HTTP request through the named credential.
     * @param endpoint The endpoint of the URL specified in the named credential to send the request to.
     * @param method The HTTP method to use.
     * @param body Nullable body of the HTTP request.
     * @return The body of the HTTP response.
     */
    private static String sendRequest(
        String endpoint,
        String method,
        Map<String, Object> body
    ) {
        Http http = new Http();

        HttpRequest request = new HttpRequest();
        request.setEndpoint('callout:GearsetArchiveViewer/' + endpoint);
        request.setMethod(method);
        request.setTimeout(120000);
        request.setHeader('Content-Type', 'application/json');

        if (method == 'POST') {
            request.setBody(JSON.serialize(body));
        }

        HttpResponse response = http.send(request);

        if (response.getStatusCode() != 200) {
            String message = JSON.serialize(
                new NonOkResponse(response.getStatusCode(), response.getBody())
            );

            AuraHandledException auraException = new AuraHandledException(
                message
            );
            auraException.setMessage(message);
            throw auraException;
        }

        return response.getBody();
    }

    /**
     * @description Proxies a HTTP GET request through the named credential.
     * @param endpoint The endpoint of the URL specified in the named credential to send the request to.
     * @return The body of the HTTP response.
     */
    @AuraEnabled
    public static String getRequest(String endpoint) {
        return sendRequest(endpoint, 'GET', null);
    }

    /**
     * @description Proxies a HTTP POST request through the named credential.
     * @param endpoint The endpoint of the URL specified in the named credential to send the request to.
     * @param body The body of the HTTP request.
     * @return The body of the HTTP response.
     */
    @AuraEnabled
    public static String postRequest(
        String endpoint,
        Map<String, Object> body
    ) {
        return sendRequest(endpoint, 'POST', body);
    }

    /**
     * @description A proxied non-200 response with the status code and body.
     */
    public class NonOkResponse {
        public Integer statusCode;
        public String responseBody;
        public String type = 'NonOkResponse';

        /**
         * @description A proxied non-200 response with the status code and body.
         * @param statusCode The status code of the response.
         * @param responseBody The body of the HTTP response.
         */
        public NonOkResponse(Integer statusCode, String responseBody) {
            this.statusCode = statusCode;
            this.responseBody = responseBody;
        }
    }
}
