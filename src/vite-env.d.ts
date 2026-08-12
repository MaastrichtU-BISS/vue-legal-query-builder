/// <reference types="vite/client" />

// No VITE_* declarations here on purpose.
//
// A bundler replaces `import.meta.env.VITE_*` with its literal value at build
// time, so reading a credential that way compiles it into this package's
// published bundle and into every application that installs it. Blocks that
// need to call the API take their client from LegalDocsForm instead — see
// components/clientContext.ts.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
