import { createTestWireAdapter } from "@salesforce/wire-service-jest-util";

//
// Used to capture the MixIn calls. There is no way of doing this using Salesforce support libs.
//

export const CurrentPageReference = createTestWireAdapter(jest.fn());

const Navigate = Symbol("Navigate");
const GenerateUrl = Symbol("GenerateUrl");

export const NavigationMixin = (Base) => {
    return class extends Base {
        [Navigate](pageReference, replace) {
            const detailObj = {
                detail: {
                    pageReference,
                    replace
                }
            };
            this.dispatchEvent(new CustomEvent("navigate", detailObj));
        }
        [GenerateUrl](pageReference) {
            const detailObj = {
                detail: {
                    pageReference
                }
            };
            this.dispatchEvent(new CustomEvent("generate", detailObj));
        }
    };
};
NavigationMixin.Navigate = Navigate;
NavigationMixin.GenerateUrl = GenerateUrl;
