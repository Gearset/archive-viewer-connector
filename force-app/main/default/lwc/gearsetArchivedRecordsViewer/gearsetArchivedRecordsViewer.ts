import { api, LightningElement, wire } from "lwc";
import getRequest from "@salesforce/apex/GearsetArchiveViewerController.getRequest";
import postRequest from "@salesforce/apex/GearsetArchiveViewerController.postRequest";
import {
    API_VERSION,
    ApiMessageRequest,
    ApiMessageRequestEvent,
    ApiMessageResponse,
    ComponentViewRequest,
    isApiMessageEvent,
    ObjectViewRequest,
    RecordViewRequest,
    TabOpenRequest
} from "./message-api.ts";
import {
    CurrentPageReference as CurrentPageReferenceWireAdapter,
    NavigationMixin
} from "lightning/navigation";
import {
    navigate,
    NavItemPageReference
} from "./gearsetArchivedRecordsViewerHelper.js";

type HostedPageType = "standard__navItemPage" | "standard__recordPage";

const defaultPage = {
    standard__recordPage: "archive-viewer",
    standard__navItemPage: "default-tab"
};

export default class GearsetArchivedRecordsViewer extends NavigationMixin(
    LightningElement
) {
    @api recordId!: string;
    @api objectApiName!: string;
    @api route?: string;
    @api text?: string;

    hostedPage?: HostedPageType;

    width = "100%";
    height = "900px";

    iframeUrl = "";

    connectedCallback() {
        const route =
            this.route ??
            defaultPage[this.hostedPage ?? "standard__recordPage"] ??
            "archive-viewer";
        this.iframeUrl = `{IFRAME_URL}/${route}?${new URLSearchParams({
            v: API_VERSION,
            recordId: this.recordId,
            objectName: this.objectApiName,
            text: this.text ?? ""
        }).toString()}`;
        window.addEventListener("message", this.handleMessageEvent);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @wire(CurrentPageReferenceWireAdapter)
    getStateParameters(currentPageReference: NavItemPageReference | undefined) {
        if (currentPageReference) {
            this.hostedPage = currentPageReference.type;
            if (currentPageReference.type === "standard__navItemPage") {
                const attributes = currentPageReference.attributes;
                if (attributes) {
                    this.objectApiName = attributes.objectApiName;
                    this.recordId = attributes.recordId;
                    this.route = attributes.route;
                    this.text = attributes.text;
                }
            }
        }
    }

    disconnectedCallback() {
        window.removeEventListener("message", this.handleMessageEvent);
    }

    handleMessageEvent = (event: ApiMessageRequestEvent) => {
        if (event.origin !== "{IFRAME_URL}" || !isApiMessageEvent(event)) {
            return;
        }

        void this.handleApiMessageEvent(event);
    };

    handleRequest(request: ApiMessageRequest) {
        switch (request.method) {
            case "GET":
                return getRequest({ endpoint: request.endpoint });
            case "POST":
                return postRequest({
                    endpoint: request.endpoint,
                    body: request.body
                });
            case "COMPONENT_VIEW":
                return this.openComponentView(request);
            case "TAB_OPEN":
                return this.openTab(request);
            case "RECORD_VIEW":
                return this.recordView(request);
            case "OBJECT_VIEW":
                return this.objectView(request);
        }
    }

    async handleApiMessageEvent(event: ApiMessageRequestEvent) {
        if (event.data.type === "Request") {
            const request = event.data;

            try {
                const response = await this.handleRequest(request);

                event.source!.postMessage(
                    {
                        type: "Response",
                        responseType: "Content",
                        correlationId: request.correlationId,
                        endpoint: request.endpoint,
                        content: response ?? ""
                    } satisfies ApiMessageResponse,
                    { targetOrigin: event.origin }
                );
            } catch (error) {
                event.source!.postMessage(
                    {
                        type: "Response",
                        responseType: "Error",
                        correlationId: request.correlationId,
                        endpoint: request.endpoint,
                        error: error as string
                    } satisfies ApiMessageResponse,
                    { targetOrigin: event.origin }
                );
            }
        }
    }

    openComponentView(request: ComponentViewRequest) {
        navigate(this, {
            type: "standard__webPage",
            attributes: {
                url: `/one/one.app#${btoa(
                    JSON.stringify({
                        componentDef: "c:gearsetArchivedRecordsViewer",
                        attributes: {
                            objectApiName: request.objectApiName,
                            recordId: request.recordId,
                            route: request.route
                        }
                    })
                )}`
            }
        });
    }

    openTab(request: TabOpenRequest) {
        navigate(this, {
            type: "standard__navItemPage",
            attributes: {
                apiName: "gearsetArchiveViewer",
                objectApiName: request.objectApiName,
                recordId: request.recordId,
                route: request.route,
                text: request.text
            }
        });
    }

    recordView(request: RecordViewRequest) {
        navigate(this, {
            type: "standard__recordPage",
            attributes: {
                actionName: "view",
                objectApiName: request.objectApiName,
                recordId: request.recordId
            }
        });
    }

    objectView(request: ObjectViewRequest) {
        navigate(this, {
            type: "standard__objectPage",
            attributes: {
                actionName: "home",
                objectApiName: request.objectApiName
            }
        });
    }
}
