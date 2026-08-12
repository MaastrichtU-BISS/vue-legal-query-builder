// How blocks inside the form reach the API.
//
// Some blocks need to call the service themselves while the user is still
// filling the form — the law search in SelectedLaws, for instance, queries as
// you type. They must not construct a client from a build-time environment
// variable to do it: a bundler replaces `import.meta.env.VITE_*` with the
// literal value at build time, so the token ends up compiled into the
// JavaScript of every application that installs this package, and into this
// package's own published dist.
//
// The host supplies the configuration instead, through LegalDocsForm. That
// leaves the host free to do the safe thing — point baseURL at its own proxy
// and keep the credential on its server — while still allowing a Node or
// trusted-context caller to pass an apiKey directly.

import { inject, provide, type InjectionKey } from 'vue'
import { createLegalDocsClient, type LegalDocsClient, type LegalDocsClientConfig } from 'legal-docs-client'

const clientKey: InjectionKey<() => LegalDocsClient> = Symbol('legal-docs-client')

/** Called by LegalDocsForm so the blocks beneath it can reach the API. */
export function provideClient(getConfig: () => LegalDocsClientConfig | undefined): void {
  let cached: LegalDocsClient | undefined
  let cachedFor: LegalDocsClientConfig | undefined

  provide(clientKey, () => {
    const config = getConfig()
    if (!cached || cachedFor !== config) {
      cached = createLegalDocsClient(config ?? {})
      cachedFor = config
    }
    return cached
  })
}

/**
 * The client for a block to use.
 *
 * Falls back to an unconfigured client — the package's default address and no
 * credential — when the form was not given any configuration. That fails
 * against a service requiring authentication, which is the right outcome: it
 * is a visible error rather than a silent one, and far better than the package
 * carrying a token of its own.
 */
export function useClient(): LegalDocsClient {
  const resolve = inject(clientKey, null)
  return resolve ? resolve() : createLegalDocsClient({})
}
