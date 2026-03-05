import type { App, Plugin } from 'vue'
import LegalDocsForm from './components/LegalDocsForm.vue'
import { LegalDocsClient, createLegalDocsClient } from './api/client'

// Export components
export { LegalDocsForm }

// Export API client
export { LegalDocsClient, createLegalDocsClient }

// Export types
export type {
  LegalDocumentQuery,
  LegalDocument,
  ApiResponse,
  LegalDocsClientConfig
} from './api/client'

export type {
  LegalDocsFormData,
  LegalDocsFormProps
} from './components/LegalDocsForm.vue'

// Vue plugin for registering components globally
export const LegalDocsFetcherPlugin: Plugin = {
  install(app: App) {
    app.component('LegalDocsForm', LegalDocsForm)
  }
}

// Default export for convenience
export default LegalDocsFetcherPlugin
