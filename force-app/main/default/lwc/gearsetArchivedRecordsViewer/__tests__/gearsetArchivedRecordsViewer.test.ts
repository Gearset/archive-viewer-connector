import { createElement } from "lwc";
import getRequest from "@salesforce/apex/GearsetArchiveViewerController.getRequest";
import postRequest from "@salesforce/apex/GearsetArchiveViewerController.postRequest";
import GearsetArchivedRecordsViewer from "c/gearsetArchivedRecordsViewer";
import {
    ApiMessage,
    ApiMessageRequest,
    isApiMessageEvent
} from "../message-api.ts";
import { CurrentPageReference } from "lightning/navigation";

const sendRequestAndWaitForResponse = <T>(
    request: ApiMessageRequest,
    targetOrigin: string = "*"
): Promise<T> =>
    new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
            if (!isApiMessageEvent(event)) {
                return;
            }

            const message = event.data;

            if (
                message.type !== "Response" ||
                ("endpoint" in message &&
                    message.endpoint !== request.endpoint) ||
                ("correlationId" in message &&
                    message.correlationId !== request.correlationId)
            ) {
                return;
            }

            window.removeEventListener("message", handleMessage);

            if (message.responseType === "Content") {
                let content;
                try {
                    content = JSON.parse(message.content);
                } catch {
                    content = message.content;
                }
                resolve(content as T);
            } else {
                reject(new Error(message.error));
            }
        };

        window.addEventListener("message", handleMessage);

        window.parent.postMessage(
            {
                ...request,
                type: "Request"
            } satisfies ApiMessageRequest,
            { targetOrigin }
        );
    });

jest.mock(
    "@salesforce/apex/GearsetArchiveViewerController.getRequest",
    () => ({
        default: jest.fn()
    }),
    { virtual: true }
);

jest.mock(
    "@salesforce/apex/GearsetArchiveViewerController.postRequest",
    () => ({
        default: jest.fn()
    }),
    { virtual: true }
);

const GET_RESPONSE = "GET REQUEST";
const POST_RESPONSE = "POST REQUEST";

describe("c-gearset-archived-records-viewer", () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it("passes record id, object name and version to iframe URL with default route", () => {
        const recordId = "0031700000pJRRSAA4";
        const objectApiName = "Account";

        const element = createElement<GearsetArchivedRecordsViewer>(
            "c-gearset-archived-records-viewer",
            {
                is: GearsetArchivedRecordsViewer
            }
        );

        element.recordId = recordId;
        element.objectApiName = objectApiName;

        document.body.appendChild(element);

        const iframe = element.shadowRoot!.querySelector("iframe");

        expect(iframe!.src).toEqual(
            expect.stringContaining(`/archive-viewer?`)
        );
        expect(iframe!.src).toEqual(
            expect.stringContaining(`recordId=${recordId}`)
        );
        expect(iframe!.src).toEqual(
            expect.stringContaining(`objectName=${objectApiName}`)
        );
        expect(iframe!.src).toEqual(expect.stringContaining(`v=1`));
    });

    it("route can be changed from default", () => {
        const route = "different";

        const element = createElement<GearsetArchivedRecordsViewer>(
            "c-gearset-archived-records-viewer",
            {
                is: GearsetArchivedRecordsViewer
            }
        );

        element.route = route;

        document.body.appendChild(element);

        const iframe = element.shadowRoot!.querySelector("iframe");

        expect(iframe!.src).toEqual(expect.stringContaining(`/${route}?`));
    });

    it("route when in tab context is correct", () => {
        const element = createElement<GearsetArchivedRecordsViewer>(
            "c-gearset-archived-records-viewer",
            {
                is: GearsetArchivedRecordsViewer
            }
        );

        CurrentPageReference.emit({
            type: "standard__navItemPage"
        });

        document.body.appendChild(element);

        const iframe = element.shadowRoot!.querySelector("iframe");

        expect(iframe!.src).toEqual(expect.stringContaining(`/default-tab?`));
    });

    it("route when in record page context is correct", () => {
        const element = createElement<GearsetArchivedRecordsViewer>(
            "c-gearset-archived-records-viewer",
            {
                is: GearsetArchivedRecordsViewer
            }
        );

        CurrentPageReference.emit({
            type: "standard__recordPage"
        });

        document.body.appendChild(element);

        const iframe = element.shadowRoot!.querySelector("iframe");

        expect(iframe!.src).toEqual(
            expect.stringContaining(`/archive-viewer?`)
        );
    });

    it.each`
        method    | body         | requestFunction | expectedResponse
        ${"GET"}  | ${""}        | ${getRequest}   | ${GET_RESPONSE}
        ${"POST"} | ${"content"} | ${postRequest}  | ${POST_RESPONSE}
    `(
        "proxies '$method' requests through the Apex controller",
        async ({ method, body, requestFunction, expectedResponse }) => {
            requestFunction.mockResolvedValue(JSON.stringify(expectedResponse));

            // Ensure that post message includes a source
            window.postMessage = jest.fn((message, options) => {
                const event = new MessageEvent("message", {
                    data: message,
                    origin: options?.targetOrigin,
                    source: window
                });

                window.dispatchEvent(event);
            });

            const element = createElement("c-gearset-archived-records-viewer", {
                is: GearsetArchivedRecordsViewer
            });

            document.body.appendChild(element);

            const request = {
                type: "Request",
                method,
                endpoint: "",
                correlationId: "",
                body
            } satisfies ApiMessageRequest;

            const response = await sendRequestAndWaitForResponse<string>(
                request,
                "{IFRAME_URL}"
            );

            expect(response).toBe(expectedResponse);
        }
    );

    const navigateTestParams = {
        tabOpen: {
            request: {
                method: "TAB_OPEN",
                objectApiName: "object-api-name",
                recordId: "record-id",
                route: "route",
                text: "some-text"
            },
            expectedResponse: {
                type: "standard__navItemPage",
                attributes: {
                    apiName: "gearsetArchiveViewer",
                    objectApiName: "object-api-name",
                    recordId: "record-id",
                    route: "route",
                    text: "some-text"
                }
            }
        },
        recordView: {
            request: {
                method: "RECORD_VIEW",
                objectApiName: "object-api-name",
                recordId: "record-id"
            },
            expectedResponse: {
                type: "standard__recordPage",
                attributes: {
                    actionName: "view",
                    objectApiName: "object-api-name",
                    recordId: "record-id"
                }
            }
        },
        objectView: {
            request: {
                method: "OBJECT_VIEW",
                objectApiName: "object-api-name"
            },
            expectedResponse: {
                type: "standard__objectPage",
                attributes: {
                    actionName: "home",
                    objectApiName: "object-api-name"
                }
            }
        },
        componentView: {
            request: {
                method: "COMPONENT_VIEW",
                objectApiName: "object-api-name",
                recordId: "record-id",
                route: "route"
            },
            expectedResponse: {
                type: "standard__webPage",
                attributes: {
                    url: "/one/one.app#eyJjb21wb25lbnREZWYiOiJjOmdlYXJzZXRBcmNoaXZlZFJlY29yZHNWaWV3ZXIiLCJhdHRyaWJ1dGVzIjp7Im9iamVjdEFwaU5hbWUiOiJvYmplY3QtYXBpLW5hbWUiLCJyZWNvcmRJZCI6InJlY29yZC1pZCIsInJvdXRlIjoicm91dGUifX0="
                }
            }
        }
    };

    it.each`
        testParams
        ${navigateTestParams.tabOpen}
        ${navigateTestParams.recordView}
        ${navigateTestParams.objectView}
        ${navigateTestParams.componentView}
    `("Sends 'navigation' via NavigationMixin", async ({ testParams }) => {
        const navigateHandler = jest.fn();

        window.postMessage = jest.fn((message, options) => {
            const event = new MessageEvent("message", {
                data: message,
                origin: options?.targetOrigin,
                source: window
            });

            window.dispatchEvent(event);
        });

        const element = createElement("c-gearset-archived-records-viewer", {
            is: GearsetArchivedRecordsViewer
        });

        element.addEventListener("navigate", navigateHandler);

        document.body.appendChild(element);

        await sendRequestAndWaitForResponse(
            {
                ...(testParams.request as ApiMessageRequest),
                correlationId: "dummy",
                type: "Request"
            },
            "{IFRAME_URL}"
        );

        expect(navigateHandler).toHaveBeenCalled();
        expect(navigateHandler).toHaveBeenCalledTimes(1);

        const navigateArgument =
            navigateHandler.mock.calls[0][0].detail.pageReference;
        expect(navigateArgument).toStrictEqual(testParams.expectedResponse);
    });
});

describe("c-gearsetArchiveViewerMessages", () => {
    describe("isProxiedMessageEvent", () => {
        it.each`
            message
            ${{ type: "Request", method: "Get", endpoint: "anything" }}
            ${{ type: "Request", method: "Post", endpoint: "anything", body: "content" }}
            ${{ type: "Response", responseType: "Content", endpoint: "anything", content: "content" }}
            ${{ type: "Response", responseType: "Error", endpoint: "anything", error: "content" }}
        `(
            "returns true if message event is a proxied message event",
            ({ message }: { message: ApiMessage }) => {
                const event = new MessageEvent<ApiMessage>("message", {
                    data: message
                });

                const result = isApiMessageEvent(event);

                expect(result).toBe(true);
            }
        );

        it.each`
            data
            ${null}
            ${undefined}
            ${{}}
        `(
            "returns false if message event event is not a proxied message event",
            ({ data }: { data: unknown }) => {
                const event = new MessageEvent("message", { data });

                const result = isApiMessageEvent(event);

                expect(result).toBe(false);
            }
        );
    });

    describe("sendRequestAndWaitForResponse", () => {
        let activeMessageHandlers = [] as ((
            ev: MessageEvent<unknown>
        ) => unknown)[];

        beforeEach(() => {
            // Ensure that post message includes a source
            window.postMessage = jest.fn((message, options) => {
                const event = new MessageEvent("message", {
                    data: message,
                    origin: options?.targetOrigin,
                    source: window
                });

                window.dispatchEvent(event);
            });
        });

        afterEach(() => {
            activeMessageHandlers.forEach((handler) =>
                window.removeEventListener("message", handler)
            );

            activeMessageHandlers = [];
        });

        const proxiedMessageHandler = (response: unknown) => {
            const messageHandler = jest.fn((event: MessageEvent) => {
                if (
                    !isApiMessageEvent(event) ||
                    event.data.type !== "Request"
                ) {
                    return;
                }

                event.source!.postMessage(response, {
                    targetOrigin: event.origin
                });
            });

            window.addEventListener("message", messageHandler);
            activeMessageHandlers.push(messageHandler);

            return messageHandler;
        };

        const createMessageFromContent = (
            content: unknown,
            endpoint: string = ""
        ): ApiMessage => ({
            type: "Response",
            responseType: "Content",
            correlationId: "CorrelationId",
            endpoint: endpoint,
            content: JSON.stringify(content)
        });

        it.each`
            method    | body
            ${"GET"}  | ${undefined}
            ${"POST"} | ${{ content: 0 }}
        `(
            "sends a $method request and waits for the response",
            async ({ method, body }) => {
                const expectedContent = { anything: 0 };

                const messageHandler = proxiedMessageHandler(
                    createMessageFromContent(expectedContent)
                );

                const content = await sendRequestAndWaitForResponse<object>({
                    type: "Request",
                    endpoint: "",
                    correlationId: "CorrelationId",
                    method,
                    body
                });

                expect(content).toStrictEqual(expectedContent);
                expect(messageHandler).toHaveBeenCalledWith(
                    new MessageEvent("message", {
                        data: { endpoint: "", method, body }
                    })
                );
            }
        );

        it("ignores non-proxied message responses", async () => {
            const ignoredHandler = proxiedMessageHandler(undefined);

            const expectedContent = { anything: 0 };
            proxiedMessageHandler(createMessageFromContent(expectedContent));

            const content = await sendRequestAndWaitForResponse<object>({
                type: "Request",
                endpoint: "",
                correlationId: "CorrelationId",
                method: "GET"
            });

            expect(content).toStrictEqual(expectedContent);
            expect(ignoredHandler).toHaveBeenCalled();
        });

        it("ignores messages for a different endpoint", async () => {
            const ignoredHandler = proxiedMessageHandler(
                createMessageFromContent(undefined, "different-endpoint")
            );

            const expectedContent = { anything: 0 };
            proxiedMessageHandler(
                createMessageFromContent(expectedContent, "my-endpoint")
            );

            const content = await sendRequestAndWaitForResponse<object>({
                type: "Request",
                endpoint: "my-endpoint",
                correlationId: "CorrelationId",
                method: "GET"
            });

            expect(content).toStrictEqual(expectedContent);
            expect(ignoredHandler).toHaveBeenCalled();
        });

        it("rejects on error response", async () => {
            proxiedMessageHandler({
                type: "Response",
                correlationId: "CorrelationId",
                responseType: "Error",
                error: "My error",
                endpoint: ""
            } satisfies ApiMessage);

            await expect(
                sendRequestAndWaitForResponse<object>({
                    type: "Request",
                    endpoint: "",
                    correlationId: "CorrelationId",
                    method: "GET"
                })
            ).rejects.toThrow("My error");
        });
    });
});
