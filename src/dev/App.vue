<template>
  <div id="app">
    <div class="demo-container">
      <h1>Legal Docs Fetcher - Demo</h1>
      <p class="subtitle">Test the component and API client</p>
      
      <LegalDocsForm 
        title="Document Request Form"
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
import type { LegalDocsFormData } from '../components/LegalDocsForm.vue'

// Initialize the API client
// Replace with your actual API endpoint
const client = createLegalDocsClient({
  baseURL: 'https://api.example.com/v1',
  apiKey: 'your-api-key-here', // Optional
  timeout: 10000
})

// Handle form submission
const handleFormSubmit = async (formData: LegalDocsFormData) => {
  console.log('Form submitted with data:', formData)
  
  try {
    // Use the API client to fetch documents
    const documents = await client.fetchDocuments({
      documentType: formData.documentType,
      clientName: formData.clientName,
      jurisdiction: formData.jurisdiction,
      dateRange: formData.dateRange,
      referenceNumber: formData.referenceNumber
    })
    
    return documents
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

// Event handlers
const onSuccess = (result: any) => {
  console.log('Success:', result)
}

const onError = (error: Error) => {
  console.error('Error:', error)
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

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 16px;
}
</style>
