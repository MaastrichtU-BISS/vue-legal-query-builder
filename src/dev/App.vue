<template>
  <div id="app">
    <div class="demo-container">
      <LegalDocsForm 
        title="Legal Documents Search: DEMO"
        subtitle="Enter your search parameters to fetch legal documents from the API."
        :on-submit="handleFormSubmit"
        @success="onSuccess"
        @error="onError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LegalDocsForm from '../components/LegalDocsForm.vue'
import { createLegalDocsClient } from '../api/client'
import type { QueryParameters } from '../types'

const client = createLegalDocsClient({
  // You can add custom configuration here if needed (e.g., API key, timeout)
})

console.log('API Client initialized with proxy')

const handleFormSubmit = async (formData: QueryParameters) => {
  console.log('Form submitted with parameters:', formData)
  try {

    // get documents from API
    const documents = await client.fetchDocuments({
      query: formData
    })

    // get full text for each document
    const documentsWithFullText = await client.getFullText(documents.map((doc) => doc.id))
    
    return documentsWithFullText
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

const onSuccess = (result: any) => {
  console.log('Search successful:', result)
}

const onError = (error: Error) => {
  console.error('Search error:', error)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.demo-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 32px;
}
</style>
