declare module "@salesforce/apex/GearsetArchiveViewerController.getRequest" {
    export default function getRequest(param: {
        endpoint: string;
    }): Promise<string>;
}

declare module "@salesforce/apex/GearsetArchiveViewerController.postRequest" {
    export default function postRequest(param: {
        endpoint: string;
        body: Record<string, unknown>;
    }): Promise<string>;
}
