import type { App, Plugin } from 'vue'
import LegalDocsForm from './components/LegalDocsForm.vue'

// Re-export everything from legal-docs-client dependency
export * from 'legal-docs-client'

// Export components
export { LegalDocsForm }

export type {
  LegalDocsFormProps
} from './components/LegalDocsForm.vue'

// Vue plugin for registering components globally
export const VueLegalQueryBuilderPlugin: Plugin = {
  install(app: App) {
    app.component('LegalDocsForm', LegalDocsForm)
  }
}

// Default export for convenience
export default VueLegalQueryBuilderPlugin
