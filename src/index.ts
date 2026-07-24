import type { App, Plugin } from "vue";

// Export components
import LegalDocsForm from "./components/LegalDocsForm.vue";
export { LegalDocsForm };
export type { LegalDocsFormProps, Dataset, LegalDocsQuery, Goal, GoalFixedParameters, GuidedStructure, Step, Block } from "./components/types";
export { FormType, BlockType } from "./components/types";

// Explicitly import and re-export types from legal-docs-client
import type {
  LegalDocsClient,
  RechtspraakQueryParameters,
  RechtspraakDocument,
  RechtspraakFullTextDocument,
  EchrQueryParameters,
  EchrDocument,
  EchrFullTextDocument,
  LegalDocsClientConfig,
} from "legal-docs-client";
export type {
  LegalDocsClient,
  RechtspraakQueryParameters,
  RechtspraakDocument,
  RechtspraakFullTextDocument,
  EchrQueryParameters,
  EchrDocument,
  EchrFullTextDocument,
  LegalDocsClientConfig,
};
export { DocType } from "legal-docs-client";

// Explicitly import and re-export key exports
import { createLegalDocsClient } from "legal-docs-client";
export { createLegalDocsClient };

// Vue plugin for registering components globally
export const VueLegalQueryBuilderPlugin: Plugin = {
  install(app: App) {
    app.component("LegalDocsForm", LegalDocsForm);
  },
};

// Default export for convenience
export default VueLegalQueryBuilderPlugin;
