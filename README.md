# Legal Docs Fetcher

A reusable Vue 3 component library with a form interface and API client for fetching legal documents. This package allows teams to maintain a single codebase that can be imported across multiple projects.

## Features

- 📝 **Vue 3 Form Component** - Pre-built, customizable form for legal document queries
- 🔌 **API Client** - Axios-based client for easy integration with your backend
- 🎨 **Styled Components** - Beautiful, responsive design out of the box
- 📦 **TypeScript Support** - Full type safety and IntelliSense
- 🔧 **Flexible** - Use components independently or together

## Installation

```bash
npm install legal-docs-fetcher
```

or

```bash
yarn add legal-docs-fetcher
```

or

```bash
pnpm add legal-docs-fetcher
```

## Usage

### 1. Using the Complete Package (Component + API Client)

```vue
<template>
  <LegalDocsForm 
    title="Search Legal Documents"
    :on-submit="handleSubmit"
    @success="onSuccess"
    @error="onError"
  />
</template>

<script setup>
import { LegalDocsForm, createLegalDocsClient } from 'legal-docs-fetcher'
import 'legal-docs-fetcher/style.css'

// Initialize the API client
const client = createLegalDocsClient({
  baseURL: 'https://your-api.com/v1',
  apiKey: 'your-api-key', // optional
  timeout: 10000 // optional, default 30000ms
})

// Handle form submission
const handleSubmit = async (formData) => {
  const documents = await client.fetchDocuments(formData)
  return documents
}

const onSuccess = (result) => {
  console.log('Documents fetched:', result)
}

const onError = (error) => {
  console.error('Error:', error)
}
</script>
```

### 2. Using Just the API Client

```javascript
import { createLegalDocsClient } from 'legal-docs-fetcher'

// Create client instance
const client = createLegalDocsClient({
  baseURL: 'https://your-api.com/v1',
  apiKey: 'your-api-key'
})

// Fetch documents
const documents = await client.fetchDocuments({
  documentType: 'contract',
  clientName: 'Acme Corp',
  jurisdiction: 'California'
})

// Search documents
const results = await client.searchDocuments('employment', {
  jurisdiction: 'New York'
})

// Get a specific document
const document = await client.getDocument('doc-123')

// Download a document
const blob = await client.downloadDocument('doc-123')
```

### 3. Using Just the Form Component

```vue
<template>
  <LegalDocsForm 
    :on-submit="customSubmit"
  />
</template>

<script setup>
import { LegalDocsForm } from 'legal-docs-fetcher'
import 'legal-docs-fetcher/style.css'

const customSubmit = async (formData) => {
  // Your custom logic here
  const response = await fetch('/your-endpoint', {
    method: 'POST',
    body: JSON.stringify(formData)
  })
  return response.json()
}
</script>
```

### 4. Register Component Globally

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import LegalDocsFetcherPlugin from 'legal-docs-fetcher'
import 'legal-docs-fetcher/style.css'

const app = createApp(App)
app.use(LegalDocsFetcherPlugin)
app.mount('#app')
```

Now you can use `<LegalDocsForm />` anywhere in your app without importing it.

## API Reference

### LegalDocsForm Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Legal Documents Fetcher"` | Form title |
| `onSubmit` | `function` | - | Async function called on form submission |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `LegalDocsFormData` | Emitted when form is submitted |
| `success` | `any` | Emitted when submission succeeds |
| `error` | `Error` | Emitted when submission fails |

#### Form Data Structure

```typescript
interface LegalDocsFormData {
  documentType: string      // contract, agreement, policy, terms
  clientName: string         // Client name
  jurisdiction: string       // e.g., "California, USA"
  dateRange: string          // Date in YYYY-MM-DD format
  referenceNumber: string    // Optional reference
}
```

### API Client Methods

#### `createLegalDocsClient(config)`

Creates a new API client instance.

```typescript
interface LegalDocsClientConfig {
  baseURL: string              // API base URL (required)
  apiKey?: string              // Optional API key
  timeout?: number             // Request timeout in ms (default: 30000)
  headers?: Record<string, string>  // Custom headers
}
```

#### `client.fetchDocuments(query)`

Fetch documents based on query parameters.

```typescript
await client.fetchDocuments({
  documentType: 'contract',
  clientName: 'Acme Corp',
  jurisdiction: 'California'
})
```

#### `client.getDocument(id)`

Get a specific document by ID.

```typescript
const document = await client.getDocument('doc-123')
```

#### `client.searchDocuments(searchTerm, filters?)`

Search documents with optional filters.

```typescript
const results = await client.searchDocuments('employment', {
  jurisdiction: 'New York'
})
```

#### `client.downloadDocument(id)`

Download a document as a Blob.

```typescript
const blob = await client.downloadDocument('doc-123')
const url = URL.createObjectURL(blob)
```

#### `client.setApiKey(apiKey)`

Update the API key after initialization.

```typescript
client.setApiKey('new-api-key')
```

#### `client.setHeaders(headers)`

Set custom headers.

```typescript
client.setHeaders({
  'X-Custom-Header': 'value'
})
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build the library
npm run build
```

### Project Structure

```
legal-docs-fetcher/
├── src/
│   ├── api/
│   │   └── client.ts          # API client
│   ├── components/
│   │   └── LegalDocsForm.vue  # Form component
│   ├── dev/
│   │   ├── App.vue            # Demo app
│   │   └── main.ts            # Demo entry point
│   └── index.ts               # Package entry point
├── dist/                      # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Publishing to NPM

1. Update version in `package.json`
2. Build the package: `npm run build`
3. Login to npm: `npm login`
4. Publish: `npm publish`

### Before Publishing

Make sure to:
- Update the author field in `package.json`
- Add your repository URL
- Review and update the license
- Test the package locally using `npm link`

## TypeScript

This package includes TypeScript definitions. All types are exported and available for use:

```typescript
import type { 
  LegalDocsFormData,
  LegalDocument,
  LegalDocumentQuery,
  LegalDocsClientConfig
} from 'legal-docs-fetcher'
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Vue 3.4.0+
- ES2020+

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
