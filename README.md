# legal-docs-fetcher

A Vue 3 component library for searching legal documents.

## Installation

```bash
npm install legal-docs-fetcher
```

*(Not published to npm registry yet)*

## Features

- Form component with search fields for legal documents
- Support for Rechtspraak, ECHR, and CJEU datasets
- API client for network requests
- TypeScript support

## Usage

Import and use the component in your Vue application:

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
import 'legal-docs-fetcher/dist/style.css'

const client = createLegalDocsClient({
  baseURL: '/api'
})

const handleSubmit = async (formData) => {
  const response = await client.fetchDocuments({ query: formData })
  return response
}

const onSuccess = (data) => {
  console.log('Success:', data)
}

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
