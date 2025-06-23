declare module "lightning/navigation" {
    export interface PageReference {
        type: string;
        attributes: {
            [key: string]: string;
        };
        state?: {
            [key: string]: string;
        };
    }

    export const CurrentPageReference: WireAdapter;
    export type CurrentPageReference = PageReference;

    export interface NavigationMixinType {
        Navigate: (pageReference: PageReference, replace?: boolean) => void;
    }

    export function NavigationMixin<T extends typeof LightningElement>(
        Base: T
    ): T & NavigationMixinType;
}
