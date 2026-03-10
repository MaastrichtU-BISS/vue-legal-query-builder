<template>
    <div class="legal-docs-form">
            <h2 class="title">{{ title }}</h2>
            <p class="subtitle"> {{ subtitle }}</p>

            <form @submit.prevent="handleSubmit" class="form-container">
                <!-- Dataset Selection -->
                <div class="form-group">
                    <label>Dataset</label>
                    <div class="button-group">
                        <button type="button" @click="formData.selectedDataset = DataSource.RS"
                            :class="{ 'active': formData.selectedDataset === DataSource.RS }">
                            Rechtspraak
                        </button>
                        <button type="button" @click="formData.selectedDataset = DataSource.ECHR"
                            :class="{ 'active': formData.selectedDataset === DataSource.ECHR }">
                            ECHR
                        </button>
                        <button type="button" disabled
                            :class="{ 'active': formData.selectedDataset === DataSource.CJEU }">
                            CJEU
                        </button>
                    </div>
                </div>

                <!-- Keywords (chip input) -->
                <div class="form-group">
                    <label for="keywords">Keywords</label>
                    <div class="chips-container">
                        <span v-for="(keyword, index) in formData.keywords" :key="index" class="chip">
                            {{ keyword }}
                            <button type="button" @click="removeKeyword(index)" class="chip-remove">
                                ×
                            </button>
                        </span>
                        <input v-model="currentKeyword" @keydown="handleKeywordKeydown" @blur="addKeywordFromInput"
                            type="text" placeholder="Type and press Enter" class="chip-input" />
                    </div>
                </div>

                <!-- ECLIs -->
                <div class="form-group">
                    <label for="eclis">ECLIs (comma-separated)</label>
                    <input id="eclis" v-model="formData.eclis" type="text"
                        placeholder="e.g., ECLI:NL:HR:2020:123, ECLI:NL:HR:2020:456" />
                </div>

                <!-- Rechtspraak-specific: Law References -->
                <div v-if="formData.selectedDataset === DataSource.RS" class="form-group">
                    <div class="label-with-toggle">
                        <label>Law References</label>
                        <button type="button" @click="formData.selectedLawsIntersect = !formData.selectedLawsIntersect"
                            class="intersect-toggle"
                            :title="formData.selectedLawsIntersect ? 'AND mode: All laws required' : 'OR mode: Any law matches'">
                            {{ formData.selectedLawsIntersect ? 'AND' : 'OR' }}
                        </button>
                    </div>
                    <textarea v-model="formData.articles" placeholder="Enter law articles (e.g., Art. 6:162 BW)"
                        rows="2"></textarea>
                </div>

                <!-- ECHR-specific: Article Fields -->
                <template v-if="formData.selectedDataset === DataSource.ECHR">
                    <!-- Articles Violated -->
                    <div class="form-group">
                        <div class="label-with-toggle">
                            <label>Articles Violated</label>
                            <button type="button"
                                @click="formData.articleViolatedIntersect = !formData.articleViolatedIntersect"
                                class="intersect-toggle">
                                {{ formData.articleViolatedIntersect ? 'AND' : 'OR' }}
                            </button>
                        </div>
                        <input v-model="formData.articleViolatedInput" type="text" placeholder="e.g., P1-1, 3, 8" />
                    </div>

                    <!-- Articles Applied -->
                    <div class="form-group">
                        <div class="label-with-toggle">
                            <label>Articles Applied</label>
                            <button type="button"
                                @click="formData.articleAppliedIntersect = !formData.articleAppliedIntersect"
                                class="intersect-toggle">
                                {{ formData.articleAppliedIntersect ? 'AND' : 'OR' }}
                            </button>
                        </div>
                        <input v-model="formData.articleAppliedInput" type="text" placeholder="e.g., P1-1, 3, 8" />
                    </div>

                    <!-- Articles Non-Violated -->
                    <div class="form-group">
                        <div class="label-with-toggle">
                            <label>Articles Non-Violated</label>
                            <button type="button"
                                @click="formData.articleNonViolatedIntersect = !formData.articleNonViolatedIntersect"
                                class="intersect-toggle">
                                {{ formData.articleNonViolatedIntersect ? 'AND' : 'OR' }}
                            </button>
                        </div>
                        <input v-model="formData.articleNonViolatedInput" type="text" placeholder="e.g., P1-1, 3, 8" />
                    </div>

                    <!-- Application Numbers -->
                    <div class="form-group">
                        <label for="applicationNumber">Application Numbers (comma-separated)</label>
                        <input id="applicationNumber" v-model="formData.applicationNumber" type="text"
                            placeholder="e.g., 12345/00, 67890/01" />
                    </div>

                    <!-- Respondent State -->
                    <div class="form-group">
                        <label for="respondentState">Respondent State (comma-separated)</label>
                        <input id="respondentState" v-model="formData.respondentStateInput" type="text"
                            placeholder="e.g., NLD, FRA, DEU" />
                    </div>
                </template>

                <!-- Instances (Rechtspraak only - hierarchical checkboxes) -->
                <div v-if="formData.selectedDataset === DataSource.RS" class="form-group">
                    <button type="button" @click="showInstances = !showInstances" class="toggle-advanced">
                        {{ showInstances ? '▼' : '▶' }} Instances
                    </button>
                    <div v-if="showInstances" class="hierarchical-checkboxes">
                        <div v-for="instance in instances" :key="instance.value" class="hierarchy-level" :style="{ marginLeft: instance.level * 20 + 'px' }">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    :checked="formData.selectedInstances.includes(instance.value)"
                                    @change="toggleInstance(instance.value, instance.children || [])"
                                />
                                {{ instance.label }}
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Domains (Rechtspraak only - hierarchical checkboxes) -->
                <div v-if="formData.selectedDataset === DataSource.RS" class="form-group">
                    <button type="button" @click="showDomains = !showDomains" class="toggle-advanced">
                        {{ showDomains ? '▼' : '▶' }} Domains
                    </button>
                    <div v-if="showDomains" class="hierarchical-checkboxes">
                        <div v-for="domain in domains" :key="domain.value" class="hierarchy-level" :style="{ marginLeft: domain.level * 20 + 'px' }">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    :checked="formData.selectedDomains.includes(domain.value)"
                                    @change="toggleDomain(domain.value, domain.children || [])"
                                />
                                {{ domain.label }}
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Advanced Settings Toggle -->
                <div class="form-group">
                    <button type="button" @click="showAdvanced = !showAdvanced" class="toggle-advanced">
                        {{ showAdvanced ? '▼' : '▶' }} Advanced Settings
                    </button>
                </div>

                <!-- Advanced Settings -->
                <template v-if="showAdvanced">
                    <!-- Date Range -->
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="dateStart">Start Date</label>
                            <input id="dateStart" v-model="formData.dateStart" type="date" />
                        </div>
                        <div class="form-group">
                            <label for="dateEnd">End Date</label>
                            <input id="dateEnd" v-model="formData.dateEnd" type="date" />
                        </div>
                    </div>

                    <!-- Network Degrees -->
                    <div class="form-group-row">
                        <div class="form-group">
                            <label for="degreesSource">Degrees Sources</label>
                            <input id="degreesSource" v-model.number="formData.degreesSource" type="number" min="0" />
                        </div>
                        <div class="form-group">
                            <label for="degreesTarget">Degrees Targets</label>
                            <input id="degreesTarget" v-model.number="formData.degreesTarget" type="number" min="0" />
                        </div>
                    </div>

                    <!-- Document Types (Rechtspraak) -->
                    <div v-if="formData.selectedDataset === DataSource.RS" class="form-group">
                        <label>Document Types</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="formData.decisions" />
                                Decision
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="formData.opinions" />
                                Opinion
                            </label>
                        </div>
                    </div>

                    <!-- ECHR Advanced -->
                    <template v-if="formData.selectedDataset === DataSource.ECHR">
                        <!-- Global Article Intersect -->
                        <div class="form-group">
                            <div class="label-with-toggle">
                                <label>Article Intersect Mode</label>
                                <button type="button"
                                    @click="formData.articleGlobalIntersect = !formData.articleGlobalIntersect"
                                    class="intersect-toggle">
                                    {{ formData.articleGlobalIntersect ? 'AND' : 'OR' }}
                                </button>
                            </div>
                            <p class="help-text">
                                Controls how article filters work together across all fields
                            </p>
                        </div>

                        <!-- Language -->
                        <div class="form-group">
                            <label for="language">Language (comma-separated)</label>
                            <input id="language" v-model="formData.languageInput" type="text"
                                placeholder="e.g., ENG, FRE" />
                        </div>

                        <!-- Importance Levels -->
                        <div class="form-group">
                            <label>Importance Level</label>
                            <div class="checkbox-group">
                                <label v-for="level in [1, 2, 3, 4]" :key="level" class="checkbox-label">
                                    <input type="checkbox" :checked="formData.importance.includes(level)"
                                        @change="toggleImportance(level)" />
                                    Level {{ level }} {{ level === 1 ? '(highest)' : level === 4 ? '(lowest)' : '' }}
                                </label>
                            </div>
                        </div>
                    </template>
                </template>

                <!-- Action Buttons -->
                <div class="form-actions">
                    <button type="button" @click="handleReset" :disabled="loading">
                        Reset
                    </button>
                    <button type="submit" :disabled="loading">
                        {{ loading ? 'Searching...' : 'Search Documents' }}
                    </button>
                </div>
            </form>

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
import { DataSource, DocType, INSTANCES_OPTIONS, DOMAINS_OPTIONS } from 'legal-docs-client'


export interface LegalDocsFormProps {
    title?: string
    subtitle?: string
    onSubmit?: (data: QueryParameters) => Promise<any>
}

const props = withDefaults(defineProps<LegalDocsFormProps>(), {
    title: 'Legal Documents Search'
})

const emit = defineEmits<{
    submit: [data: QueryParameters]
    success: [result: any]
    error: [error: Error]
}>()

// Build hierarchical instances from INSTANCES_OPTIONS
interface OptionNode {
    value: string
    label: string
    level: number
    children?: string[]
}

const buildHierarchy = (options: any[]): OptionNode[] => {
    const nodes: OptionNode[] = []
    
    // Convert options to OptionNode array
    if (Array.isArray(options)) {
        const items = options as any[]
        items.forEach((item) => {
            let value: string
            let label: string
            let level: number = 0
            let children: string[] | undefined = undefined
            
            if (typeof item === 'string') {
                // Simple string entry
                value = item
                label = item
            } else if (typeof item === 'object' && item !== null) {
                // Object entry
                const anyItem = item as any
                if (anyItem.name) {
                    value = anyItem.name
                    label = anyItem.name
                    level = anyItem.level || 0
                    if (anyItem.children && Array.isArray(anyItem.children)) {
                        children = anyItem.children.map((child: any, index: number) => {
                            // Use unique ID combining parent and index to avoid ambiguity with duplicate child names
                            const childValue = typeof child === 'string' ? child : (child.name || child.value || String(child))
                            return `${value}__${index}__${childValue}`
                        })
                    }
                } else {
                    // Try to use first property as key
                    const keys = Object.keys(anyItem)
                    if (keys.length > 0) {
                        const key = keys[0]
                        value = key
                        label = key
                        const childData = anyItem[key]
                        if (Array.isArray(childData)) {
                            children = childData.map((child: any, index: number) => {
                                // Use unique ID combining parent and index to avoid ambiguity
                                const childValue = typeof child === 'string' ? child : (child.name || child.value || String(child))
                                return `${key}__${index}__${childValue}`
                            })
                        }
                    } else {
                        return
                    }
                }
            } else {
                return
            }
            
            const node: OptionNode = { value, label, level, ...(children && { children }) }
            nodes.push(node)
            
            // Add child nodes
            if (children) {
                children.forEach((childId) => {
                    if (!nodes.find(n => n.value === childId)) {
                        // Extract the display label from the unique ID (last part)
                        const childLabel = childId.split('__').pop() || childId
                        nodes.push({ value: childId, label: childLabel, level: level + 1 })
                    }
                })
            }
        })
    }
    
    return nodes.length > 0 ? nodes : []
}

const instances = buildHierarchy(INSTANCES_OPTIONS)
const domains = buildHierarchy(DOMAINS_OPTIONS)

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

const currentKeyword = ref('')
const showAdvanced = ref(false)
const showInstances = ref(false)
const showDomains = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Keyword chip management
function handleKeywordKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        addKeywordFromInput()
    } else if (event.key === 'Backspace' && currentKeyword.value === '' && formData.keywords.length) {
        event.preventDefault()
        removeKeyword(formData.keywords.length - 1)
    }
}

function addKeywordFromInput() {
    const entries = currentKeyword.value
        .split(',')
        .map(item => item.trim())
        .filter(item => item && !formData.keywords.includes(item))

    if (entries.length) {
        formData.keywords.push(...entries)
        currentKeyword.value = ''
    }
}

function removeKeyword(index: number) {
    formData.keywords.splice(index, 1)
}

function toggleImportance(level: number) {
    const index = formData.importance.indexOf(level)
    if (index > -1) {
        formData.importance.splice(index, 1)
    } else {
        formData.importance.push(level)
    }
}

function toggleInstance(instanceValue: string, childValues: string[]) {
    const index = formData.selectedInstances.indexOf(instanceValue)
    
    if (index > -1) {
        // Unchecking parent - remove parent and all children
        formData.selectedInstances.splice(index, 1)
        childValues.forEach(childValue => {
            const childIndex = formData.selectedInstances.indexOf(childValue)
            if (childIndex > -1) {
                formData.selectedInstances.splice(childIndex, 1)
            }
        })
    } else {
        // Checking parent - add parent and all children
        formData.selectedInstances.push(instanceValue)
        childValues.forEach(childValue => {
            if (!formData.selectedInstances.includes(childValue)) {
                formData.selectedInstances.push(childValue)
            }
        })
    }
}

function toggleDomain(domainValue: string, childValues: string[]) {
    const index = formData.selectedDomains.indexOf(domainValue)
    
    if (index > -1) {
        // Unchecking parent - remove parent and all children
        formData.selectedDomains.splice(index, 1)
        childValues.forEach(childValue => {
            const childIndex = formData.selectedDomains.indexOf(childValue)
            if (childIndex > -1) {
                formData.selectedDomains.splice(childIndex, 1)
            }
        })
    } else {
        // Checking parent - add parent and all children
        formData.selectedDomains.push(domainValue)
        childValues.forEach(childValue => {
            if (!formData.selectedDomains.includes(childValue)) {
                formData.selectedDomains.push(childValue)
            }
        })
    }
}

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
        // Flatten selected instances to their values
        const instanceValues = formData.selectedInstances
            .map(id => instances.find(inst => inst.value === id)?.value)
            .filter((value): value is string => value !== undefined)
        if (instanceValues.length > 0) params.instances = instanceValues
    }

    // Parse Domains
    if (formData.selectedDomains.length > 0) {
        // Flatten selected domains to their values
        const domainValues = formData.selectedDomains
            .map(id => domains.find(d => d.value === id)?.value)
            .filter((value): value is string => value !== undefined)
        if (domainValues.length > 0) params.domains = domainValues
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
    currentKeyword.value = ''
    showAdvanced.value = false
    showInstances.value = false
    showDomains.value = false
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

/* Chips Container */
.chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    min-height: 44px;
    align-items: center;
}

.chips-container:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background-color: #e5e7eb;
    border-radius: 16px;
    font-size: 13px;
    color: #374151;
}

.chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0;
    border-radius: 50%;
    transition: all 0.2s;
}

.chip-remove:hover {
    background-color: #d1d5db;
    color: #dc2626;
}

.chip-input {
    flex: 1;
    min-width: 120px;
    border: none;
    outline: none;
    font-size: 14px;
    padding: 4px 0;
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

.title {
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 32px;
  font-size: 16px;
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
