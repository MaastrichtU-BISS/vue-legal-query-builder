// What the blocks inside the form ask the host to do for them.
//
// This package builds a query and never sends one. Anything that needs the API
// is handed back to whoever mounted the form, the same way `onSubmit` already
// works — because a component that calls the API needs a credential, and a
// credential in a page is readable by everyone using it and usable by them for
// whatever they like.
//
// Most blocks need nothing. A few look things up while the user types, and
// those take a callback from here rather than reaching out themselves.

import { inject, provide, type InjectionKey } from 'vue'
import type { BWBItem } from 'legal-docs-types'

/** Searches legislation by name. Supplied by the host; see LegalDocsForm. */
export type SearchLaws = (query: string) => Promise<BWBItem[]>

export interface HostCallbacks {
  searchLaws?: SearchLaws
}

const key: InjectionKey<HostCallbacks> = Symbol('legal-query-builder-host')

/** Called by LegalDocsForm so its blocks can reach the host. */
export function provideHostCallbacks(callbacks: HostCallbacks): void {
  provide(key, callbacks)
}

/**
 * The host's callbacks, or an empty set when the form was mounted without any.
 *
 * A block whose callback is missing should say so rather than appear broken —
 * the host simply has not wired that feature up, and the block is the only
 * place that can explain it.
 */
export function useHostCallbacks(): HostCallbacks {
  return inject(key, {})
}
