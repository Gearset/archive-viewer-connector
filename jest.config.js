import { jestConfig } from "@salesforce/sfdx-lwc-jest/config.js";
export default {
    ...jestConfig,
    moduleNameMapper: {
        '^lightning/navigation$':
            '<rootDir>/force-app/test/jest-mocks/lightning/navigation'
    },
    reporters: ["default"]
};
