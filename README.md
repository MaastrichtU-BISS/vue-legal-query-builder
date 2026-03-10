# vue-legal-query-builder

A Vue 3 component for building legal document search queries. Provides an intuitive interface for searching through court instances, legal domains, and other legal document metadata.

## Installation

```bash
npm install vue-legal-query-builder
```

## Features

- **Hierarchical Filtering**: Collapsible tree-view for court instances and legal domains with parent-child toggling
- **Keyword & ECLI Search**: Multiple input methods for searching legal documents (keywords required OR ECLIs)
- **Dataset Selection**: Support for different legal document sources (Rechtspraak dataset)
- **Advanced Settings**: Optional advanced filtering options including:
  - Date range filters
  - Network degrees
  - Document types (decisions, opinions)
  - Importance levels
- **Responsive Design**: Mobile-friendly form interface with proper spacing
- **Type-Safe**: Full TypeScript support
- **Loading States**: Visual feedback with spinning loader during search

## Usage

### Import the Component

```vue
<template>
  <LegalDocsForm 
    title="Search Legal Documents"
    subtitle="Find legal documents with advanced filtering"
    :on-submit="handleSubmit"
    @success="onSuccess"
    @error="onError"
  />
</template>

<script setup>
import { LegalDocsForm, createLegalDocsClient } from 'vue-legal-query-builder'
import 'vue-legal-query-builder/style.css'

// Create a client using the re-exported dependency
const client = createLegalDocsClient({
  baseURL: 'https://api.example.com'
})

const handleSubmit = async (queryParams) => {
  // Use the client to fetch documents
  const results = await client.fetchDocuments(queryParams)
  return results
}

const onSuccess = (data) => {
  console.log('Search successful:', data)
}

const onError = (error) => {
  console.error('Search error:', error)
}
</script>
```

### Accessing Legal Documents Client Functions

Since `vue-legal-query-builder` re-exports the entire `legal-docs-client` dependency, you only need to install `vue-legal-query-builder` to access both the form component and the client:

```javascript
import { 
  createLegalDocsClient,      // Create client instances
  QueryParameters,             // Type definitions
  DataSource,                  // Dataset enums
  DocType,                     // Document type enums
  INSTANCES_OPTIONS,           // Hierarchical instances data
  DOMAINS_OPTIONS              // Hierarchical domains data
} from 'vue-legal-query-builder'

// Create a client
const client = createLegalDocsClient()

// Use instances and domains data directly
console.log(INSTANCES_OPTIONS)
console.log(DOMAINS_OPTIONS)
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Form title (optional) |
| `subtitle` | string | Form subtitle (optional) |
| `onSubmit` | function | Callback that receives QueryParameters and returns search results (optional) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `@submit` | QueryParameters | Emitted when form is submitted |
| `@success` | any | Emitted when search completes successfully |
| `@error` | Error | Emitted when an error occurs |

## QueryParameters

The form generates search parameters with:

- `dataSources`: Array of selected datasets
- `keywords`: Array of search keywords
- `eclis`: Array of ECLI identifiers  
- `instances`: Array of selected court instances
- `domains`: Array of selected legal domains
- `dateStart`, `dateEnd`: Date range filters
- `degreesSource`, `degreesTarget`: Network degree filters
- `docTypes`: Document types filter
- And more...

## Requirements

- Vue 3.4 or higher

## Note on Dependencies

This package bundles and re-exports the entire [`legal-docs-client`](https://www.npmjs.com/package/legal-docs-client) library. You only need to install `vue-legal-query-builder` to access both the form component and all client functions. The `legal-docs-client` dependency is included and fully integrated, so there's no need to install it separately.

## License

MIT

const onError = (error) => {
  console.error('Error:', error)
}
</script>
```

## Development

Test the package locally:

```bash
npm run test:dev
```

## License

MIT
