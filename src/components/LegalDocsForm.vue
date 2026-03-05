<template>
  <div class="legal-docs-form">
    <h2>{{ title }}</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="documentType">Document Type</label>
        <select 
          id="documentType" 
          v-model="formData.documentType"
          required
        >
          <option value="">Select a type...</option>
          <option value="contract">Contract</option>
          <option value="agreement">Agreement</option>
          <option value="policy">Policy</option>
          <option value="terms">Terms & Conditions</option>
        </select>
      </div>

      <div class="form-group">
        <label for="clientName">Client Name</label>
        <input
          id="clientName"
          v-model="formData.clientName"
          type="text"
          placeholder="Enter client name"
          required
        />
      </div>

      <div class="form-group">
        <label for="jurisdiction">Jurisdiction</label>
        <input
          id="jurisdiction"
          v-model="formData.jurisdiction"
          type="text"
          placeholder="e.g., California, USA"
          required
        />
      </div>

      <div class="form-group">
        <label for="dateRange">Date Range</label>
        <input
          id="dateRange"
          v-model="formData.dateRange"
          type="date"
          required
        />
      </div>

      <div class="form-group">
        <label for="referenceNumber">Reference Number</label>
        <input
          id="referenceNumber"
          v-model="formData.referenceNumber"
          type="text"
          placeholder="Optional reference number"
        />
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Fetching...' : 'Fetch Documents' }}
        </button>
        <button type="button" @click="handleReset" :disabled="loading">
          Reset
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="result-section">
      <h3>Results</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

export interface LegalDocsFormData {
  documentType: string
  clientName: string
  jurisdiction: string
  dateRange: string
  referenceNumber: string
}

export interface LegalDocsFormProps {
  title?: string
  onSubmit?: (data: LegalDocsFormData) => Promise<any>
}

const props = withDefaults(defineProps<LegalDocsFormProps>(), {
  title: 'Legal Documents Fetcher'
})

const emit = defineEmits<{
  submit: [data: LegalDocsFormData]
  success: [result: any]
  error: [error: Error]
}>()

const formData = reactive<LegalDocsFormData>({
  documentType: '',
  clientName: '',
  jurisdiction: '',
  dateRange: '',
  referenceNumber: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<any>(null)

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  result.value = null

  try {
    emit('submit', { ...formData })
    
    if (props.onSubmit) {
      const data = await props.onSubmit({ ...formData })
      result.value = data
      emit('success', data)
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred'
    emit('error', err)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formData.documentType = ''
  formData.clientName = ''
  formData.jurisdiction = ''
  formData.dateRange = ''
  formData.referenceNumber = ''
  error.value = null
  result.value = null
}
</script>

<style scoped>
.legal-docs-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

.legal-docs-form h2 {
  margin-bottom: 24px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.form-actions button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.form-actions button[type="submit"] {
  background-color: #3b82f6;
  color: white;
}

.form-actions button[type="submit"]:hover:not(:disabled) {
  background-color: #2563eb;
}

.form-actions button[type="button"] {
  background-color: #f3f4f6;
  color: #374151;
}

.form-actions button[type="button"]:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.form-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
}

.result-section {
  margin-top: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.result-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #2c3e50;
}

.result-section pre {
  margin: 0;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}
</style>
