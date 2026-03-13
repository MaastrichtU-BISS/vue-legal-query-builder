import type { App, Plugin } from 'vue'
import LegalDocsForm from './components/LegalDocsForm.vue'

// Import and re-export all types from legal-docs-client
export type * from 'legal-docs-client'

// Import and re-export all runtime exports from legal-docs-client
export * from 'legal-docs-client'

// Explicitly import and re-export key exports
import { createLegalDocsClient as createClient } from 'legal-docs-client'
export const createLegalDocsClient = createClient

// Export components
export { LegalDocsForm }

// Export component types
export type {
  LegalDocsFormProps
} from './components/types'

// Vue plugin for registering components globally
export const VueLegalQueryBuilderPlugin: Plugin = {
  install(app: App) {
    app.component('LegalDocsForm', LegalDocsForm)
  }
}

// Default export for convenience
export default VueLegalQueryBuilderPlugin
