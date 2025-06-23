import { NavigationMixin } from "lightning/navigation";

// This is needed to work around the proxy objects used by Salesforce
export function navigate(target, pageReference, replace) {
    target[NavigationMixin.Navigate](pageReference, replace);
}
