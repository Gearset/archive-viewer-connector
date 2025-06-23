import { LightningElement } from "lwc";

declare module "./gearsetArchivedRecordsViewerHelper.js" {
    export type NavigationPageReference =
        | NavItemPageReference
        | RecordPageReference
        | ObjectPageReference
        | WebPageReference;

    export interface NavItemPageReference {
        type: "standard__navItemPage";
        attributes: {
            apiName: string;
            objectApiName: string;
            recordId: string;
            route: string;
            text: string;
        };
    }

    export interface RecordPageReference {
        type: "standard__recordPage";
        attributes: {
            actionName: "view" | "edit" | "clone";
            objectApiName: string;
            recordId: string;
        };
    }

    export interface ObjectPageReference {
        type: "standard__objectPage";
        attributes: {
            actionName: "home" | "list" | "new";
            objectApiName: string;
        };
    }

    export interface WebPageReference {
        type: "standard__webPage";
        attributes: {
            url: string;
        };
    }

    export function navigate(
        target: LightningElement,
        pageReference: NavigationPageReference,
        replace?: boolean
    ): void;
}
