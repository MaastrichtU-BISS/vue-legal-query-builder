<template>
    <div class="legal-docs-form">
        <h2 class="title">{{ props.title }}</h2>
        <p class="subtitle">{{ props.subtitle }}</p>
        <FreeForm 
            v-if="props.type === FormType.FREE"
            :formData="formData"
            :loading="loading"
            @submit="handleSubmit"
            @handleReset="handleReset"
        />
        <GuidedForm 
            v-else-if="props.type === FormType.GUIDED"
            :guidedStructure="props.guidedStructure"
            :formData="formData"
            @submit="handleSubmit"
        />

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
            {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { QueryParameters } from 'legal-docs-client'
import { DataSource, DocType } from 'legal-docs-client'
import type { LegalDocsFormProps } from './types'
import { FormType } from './types'
import FreeForm from './forms/FreeForm.vue'
import GuidedForm from './forms/GuidedForm.vue'

const props = withDefaults(defineProps<LegalDocsFormProps>(), {
    title: 'Legal Documents Search',
    subtitle: 'Search across multiple legal databases',
    type: FormType.FREE
})

const emit = defineEmits<{
    submit: [data: QueryParameters]
    success: [result: any]
    error: [error: Error]
}>()

// Form data
const formData = reactive({
    selectedDataset: DataSource.RS,
    keywords: [] as string[],
    eclis: '',
    articles: '',
    selectedLawsIntersect: true,
    selectedInstances: [] as string[],
    selectedDomains: [] as string[],
    degreesSource: 0,
    degreesTarget: 0,
    dateStart: '1900-01-01',
    dateEnd: new Date().toISOString().split('T')[0],
    decisions: true,
    opinions: false,
    engine: 'ES',
    attributesToFetch: 'ALL',
    // ECHR-specific
    articleViolatedInput: '',
    articleAppliedInput: '',
    articleNonViolatedInput: '',
    articleViolatedIntersect: false,
    articleAppliedIntersect: false,
    articleNonViolatedIntersect: false,
    articleGlobalIntersect: false,
    applicationNumber: '',
    respondentStateInput: '',
    languageInput: '',
    importance: [] as number[]
})

const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Parse form data to QueryParameters
function parseParameters(): QueryParameters {
    const doctypes: DocType[] = []
    if (formData.decisions) doctypes.push(DocType.DEC)
    if (formData.opinions) doctypes.push(DocType.OPI)

    const params: QueryParameters = {
        dataSources: [formData.selectedDataset],
        degreesSource: formData.degreesSource,
        degreesTarget: formData.degreesTarget,
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd,
        docTypes: doctypes,
        engine: formData.engine,
        attributesToFetch: formData.attributesToFetch
    }

    if (formData.keywords.length > 0) params.keywords = formData.keywords
    if (formData.articles) params.articles = formData.articles
    if (formData.selectedLawsIntersect !== undefined) params.selectedLawsIntersect = formData.selectedLawsIntersect

    // Parse ECLIs
    if (formData.eclis) {
        const eclisArray = formData.eclis
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0)
        if (eclisArray.length > 0) params.eclis = eclisArray
    }

    // Parse Instances
    if (formData.selectedInstances.length > 0) {
        params.instances = formData.selectedInstances
    }

    // Parse Domains
    if (formData.selectedDomains.length > 0) {
        params.domains = formData.selectedDomains
    }

    // ECHR-specific fields
    if (formData.selectedDataset === DataSource.ECHR) {
        if (formData.articleViolatedInput) {
            params.article_violated = formData.articleViolatedInput.split(',').map(s => s.trim()).filter(s => s)
            params.article_violated_mode = formData.articleViolatedIntersect ? 'AND' : 'OR'
        }
        if (formData.articleAppliedInput) {
            params.article_applied = formData.articleAppliedInput.split(',').map(s => s.trim()).filter(s => s)
            params.article_applied_mode = formData.articleAppliedIntersect ? 'AND' : 'OR'
        }
        if (formData.articleNonViolatedInput) {
            params.article_non_violated = formData.articleNonViolatedInput.split(',').map(s => s.trim()).filter(s => s)
            params.article_non_violated_mode = formData.articleNonViolatedIntersect ? 'AND' : 'OR'
        }
        params.articles_mode = formData.articleGlobalIntersect ? 'AND' : 'OR'

        if (formData.applicationNumber) {
            params.application_number = formData.applicationNumber.split(',').map(s => s.trim()).filter(s => s)
        }
        if (formData.respondentStateInput) {
            params.respondent_state = formData.respondentStateInput.split(',').map(s => s.trim()).filter(s => s)
        }
        if (formData.languageInput) {
            params.language = formData.languageInput.split(',').map(s => s.trim()).filter(s => s)
        }
        if (formData.importance.length > 0) {
            params.importance = formData.importance
        }
    }

    return params
}

const handleSubmit = async () => {
    // Validate that either keywords or ECLIs are provided
    if (formData.keywords.length === 0 && !formData.eclis.trim()) {
        error.value = 'Please enter either keywords or ECLIs to search'
        return
    }

    loading.value = true
    error.value = null
    successMessage.value = null

    try {
        const params = parseParameters()
        emit('submit', params)

        if (props.onSubmit) {
            const data = await props.onSubmit(params)

            // Check if data contains nodes (for network response)
            let docCount = 0
            if (data && typeof data === 'object') {
                if (Array.isArray(data.nodes)) {
                    docCount = data.nodes.length
                } else if (Array.isArray(data)) {
                    docCount = data.length
                }
            }

            successMessage.value = `${docCount} document${docCount !== 1 ? 's' : ''} fetched`
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
    formData.selectedDataset = DataSource.RS
    formData.keywords = []
    formData.eclis = ''
    formData.articles = ''
    formData.selectedLawsIntersect = true
    formData.selectedInstances = []
    formData.selectedDomains = []
    formData.degreesSource = 0
    formData.degreesTarget = 0
    formData.dateStart = '1900-01-01'
    formData.dateEnd = new Date().toISOString().split('T')[0]
    formData.decisions = true
    formData.opinions = false
    formData.engine = 'ES'
    formData.attributesToFetch = 'ALL'
    formData.articleViolatedInput = ''
    formData.articleAppliedInput = ''
    formData.articleNonViolatedInput = ''
    formData.articleViolatedIntersect = false
    formData.articleAppliedIntersect = false
    formData.articleNonViolatedIntersect = false
    formData.articleGlobalIntersect = false
    formData.applicationNumber = ''
    formData.respondentStateInput = ''
    formData.languageInput = ''
    formData.importance = []
    error.value = null
    successMessage.value = null
}
</script>

<style scoped>
.legal-docs-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
}

.legal-docs-form h2 {
    margin-bottom: 24px;
    color: #2c3e50;
}

.form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
    box-sizing: border-box;
    font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 60px;
}

/* Button Group for Dataset Selection */
.button-group {
    display: flex;
    gap: 8px;
}

.button-group button {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: #374151;
}

.button-group button:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

.button-group button.active {
    background-color: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.button-group button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Label with Toggle */
.label-with-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.intersect-toggle {
    padding: 4px 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: #374151;
}

.intersect-toggle:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

/* Form Group Row */
.form-group-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

/* Checkbox Group */
.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    user-select: none;
}

.checkbox-label input[type="checkbox"] {
    width: auto;
    cursor: pointer;
}

/* Hierarchical Checkboxes */
.hierarchical-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    max-height: 400px;
    overflow-y: auto;
}

.hierarchical-checkboxes:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hierarchy-level {
    transition: background-color 0.2s;
}

.hierarchy-level .checkbox-label {
    gap: 8px;
    padding: 4px 0;
}

/* Toggle Advanced Button */
.toggle-advanced {
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    color: #374151;
    text-align: left;
    width: 100%;
}

.toggle-advanced:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

/* Help Text */
.help-text {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
}

/* Form Actions */
.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
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

/* Success Message */
.success-message {
    margin-top: 16px;
    padding: 12px;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    color: #16a34a;
    font-size: 14px;
}

/* Error Message */
.error-message {
    margin-top: 16px;
    padding: 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 14px;
}

/* Warning Message */
.warning-message {
    margin-top: 16px;
    padding: 12px;
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 6px;
    color: #92400e;
    font-size: 14px;
}

/* Required Asterisk */
.required-asterisk {
    color: #dc2626;
    margin-left: 2px;
}

.title {
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 16px;
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
    .form-group-row {
        grid-template-columns: 1fr;
    }

    .button-group {
        flex-direction: column;
    }
}
</style>
