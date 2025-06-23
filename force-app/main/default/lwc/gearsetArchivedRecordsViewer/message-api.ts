export const API_VERSION = "1";

export type MessageMethod =
    | "GET"
    | "POST"
    | "COMPONENT_VIEW"
    | "TAB_OPEN"
    | "RECORD_VIEW"
    | "OBJECT_VIEW";

export type MessageType = "Request" | "Response";

interface MessageBase {
    type: MessageType;
    correlationId: string;
}

interface MessageRequestBase extends MessageBase {
    method: MessageMethod;
    endpoint: string; // Needs to move into HttpMessageBase, but for now we still need it for backwards compatibility
}

interface HttpGetRequest extends MessageRequestBase {
    method: "GET";
}

interface HttpPostRequest extends MessageRequestBase {
    method: "POST";
    body: Record<string, unknown>;
}

export interface ComponentViewRequest extends MessageRequestBase {
    method: "COMPONENT_VIEW";
    objectApiName: string;
    recordId: string;
    route: string;
}

export interface TabOpenRequest extends MessageRequestBase {
    method: "TAB_OPEN";
    objectApiName: string;
    recordId: string;
    route: string;
    text: string;
}

export interface RecordViewRequest extends MessageRequestBase {
    method: "RECORD_VIEW";
    objectApiName: string;
    recordId: string;
}

export interface ObjectViewRequest extends MessageRequestBase {
    method: "OBJECT_VIEW";
    objectApiName: string;
}

export type ApiMessageRequest = (
    | HttpGetRequest
    | HttpPostRequest
    | ComponentViewRequest
    | TabOpenRequest
    | RecordViewRequest
    | ObjectViewRequest
) & { type: "Request" };

export type MessageResponseType = "Content" | "Error";

export interface MessageResponseBase extends MessageBase {
    responseType: MessageResponseType;
    endpoint?: string;
}

export interface MessageContentResponse extends MessageResponseBase {
    responseType: "Content";
    content: string;
}

export interface MessageErrorResponse extends MessageResponseBase {
    responseType: "Error";
    error: string;
}

export type ApiMessageResponse = (
    | MessageContentResponse
    | MessageErrorResponse
) & {
    type: "Response";
};

export type ApiMessage = ApiMessageResponse | ApiMessageRequest;
export type ApiMessageResponseEvent = MessageEvent<ApiMessageResponse>;
export type ApiMessageRequestEvent = MessageEvent<ApiMessageRequest>;
export type ApiMessageEvent = ApiMessageResponseEvent | ApiMessageRequestEvent;

export const isApiMessageEvent = (
    event: MessageEvent
): event is ApiMessageEvent =>
    !!event.data &&
    typeof event.data === "object" &&
    "type" in event.data &&
    ("endpoint" in event.data || "correlationId" in event.data);
