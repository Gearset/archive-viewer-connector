@isTest
private class GearsetArchiveViewerController_Test {
    private class MockHttpResponseGenerator implements HttpCalloutMock {
        /**
         * @description Mock a HTTP response to a GET or POST request.
         * @param req The HTTP request.
         * @return The fake response.
         */
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(200);

            if (req.getMethod() == 'GET') {
                res.setBody('{"message": "GET request successful"}');
            } else if (req.getMethod() == 'POST') {
                res.setBody('{"message": "POST request successful"}');
            }

            return res;
        }
    }

    private class MockHttpResponseGeneratorError implements HttpCalloutMock {
        /**
         * @description Mock a failing HTTP response to a GET or POST request.
         * @param req The HTTP request.
         * @return The fake response.
         */
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setStatusCode(404);
            res.setBody('{"message": "Not Found"}');
            return res;
        }
    }

    @isTest
    static void testGetRequest() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        String response = GearsetArchiveViewerController.getRequest(
            'test-endpoint'
        );

        Assert.areEqual(
            '{"message": "GET request successful"}',
            response,
            'Expected GET request response'
        );
    }

    @isTest
    static void testPostRequest() {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        Map<String, Object> requestBody = new Map<String, Object>{
            'key' => 'value'
        };
        String response = GearsetArchiveViewerController.postRequest(
            'test-endpoint',
            requestBody
        );

        Assert.areEqual(
            '{"message": "POST request successful"}',
            response,
            'Expected POST request response'
        );
    }

    @isTest
    static void testGetRequestError() {
        Test.setMock(
            HttpCalloutMock.class,
            new MockHttpResponseGeneratorError()
        );
        try {
            GearsetArchiveViewerController.getRequest('test-error-endpoint');
            System.assert(false, 'Expected AuraHandledException to be thrown');
        } catch (AuraHandledException e) {
            String exceptionJson = e.getMessage();
            Map<String, Object> exceptionMap = (Map<String, Object>) JSON.deserializeUntyped(
                exceptionJson
            );

            Assert.areEqual(
                404,
                exceptionMap.get('statusCode'),
                'Expected status code 404'
            );
            Assert.areEqual(
                '{"message": "Not Found"}',
                exceptionMap.get('responseBody'),
                'Expected response body'
            );
            Assert.areEqual(
                'NonOkResponse',
                exceptionMap.get('type'),
                'Expected exception type'
            );
        }
    }

    @isTest
    static void testPostRequestError() {
        Test.setMock(
            HttpCalloutMock.class,
            new MockHttpResponseGeneratorError()
        );
        try {
            GearsetArchiveViewerController.postRequest(
                'test-error-endpoint',
                new Map<String, Object>{ 'key' => 'value' }
            );
            System.assert(false, 'Expected AuraHandledException to be thrown');
        } catch (AuraHandledException e) {
            String exceptionJson = e.getMessage();
            Map<String, Object> exceptionMap = (Map<String, Object>) JSON.deserializeUntyped(
                exceptionJson
            );

            Assert.areEqual(
                404,
                exceptionMap.get('statusCode'),
                'Expected status code 404'
            );
            Assert.areEqual(
                '{"message": "Not Found"}',
                exceptionMap.get('responseBody'),
                'Expected response body'
            );
            Assert.areEqual(
                'NonOkResponse',
                exceptionMap.get('type'),
                'Expected exception type'
            );
        }
    }
}
