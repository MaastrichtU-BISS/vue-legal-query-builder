<template>
    <form @submit.prevent="handleSubmit" class="form-container">
        <DatasetSelector v-model:selectedDataset="formData.selectedDataset" />

        <KeywordsInput
            label="Keywords"
            :required="true"
            v-model:keywords="formData.keywords"
            v-model:currentKeyword="currentKeyword"
        />

        <EclisInput 
            label="ECLIS"
            :required="true"
            v-model:eclis="formData.eclis" 
        />

        <!-- Law References (hidden for now) -->
        <div v-if="false && formData.selectedDataset === DataSource.RS" class="form-group">
            <label>Law References</label>
            <textarea v-model="formData.articles" placeholder="Enter law articles (e.g., Art. 6:162 BW)"
                rows="2"></textarea>
        </div>

        <!-- ECHR-specific: Article Fields -->
        <template v-if="formData.selectedDataset === DataSource.ECHR">
            <ArticleField
                label="Articles Violated"
                fieldName="articleViolated"
                v-model:value="formData.articleViolatedInput"
                v-model:isIntersect="formData.articleViolatedIntersect"
                placeholder="e.g., P1-1, 3, 8"
            />

            <ArticleField
                label="Articles Applied"
                fieldName="articleApplied"
                v-model:value="formData.articleAppliedInput"
                v-model:isIntersect="formData.articleAppliedIntersect"
                placeholder="e.g., P1-1, 3, 8"
            />

            <ArticleField
                label="Articles Non-Violated"
                fieldName="articleNonViolated"
                v-model:value="formData.articleNonViolatedInput"
                v-model:isIntersect="formData.articleNonViolatedIntersect"
                placeholder="e.g., P1-1, 3, 8"
            />

            <TextInput
                label="Application Numbers (comma-separated)"
                fieldId="applicationNumber"
                v-model:value="formData.applicationNumber"
                placeholder="e.g., 12345/00, 67890/01"
            />

            <TextInput
                label="Respondent State (comma-separated)"
                fieldId="respondentState"
                v-model:value="formData.respondentStateInput"
                placeholder="e.g., NLD, FRA, DEU"
            />
        </template>

        <InstancesSelector 
            v-if="formData.selectedDataset === DataSource.RS"
            v-model:selectedValues="formData.selectedInstances"
        />

        <DomainsSelector 
            v-if="formData.selectedDataset === DataSource.RS"
            v-model:selectedValues="formData.selectedDomains"
        />

        <!-- Advanced Settings Toggle -->
        <div class="form-group">
            <button type="button" @click="showAdvanced = !showAdvanced" class="toggle-advanced">
                {{ showAdvanced ? '▼' : '▶' }} Advanced Settings
            </button>
        </div>

        <!-- Advanced Settings -->
        <template v-if="showAdvanced">
            <DateRange
                v-model:dateStart="formData.dateStart"
                v-model:dateEnd="formData.dateEnd"
            />

            <NetworkDegrees
                v-model:degreesSource="formData.degreesSource"
                v-model:degreesTarget="formData.degreesTarget"
            />

            <DocTypeSelector 
                v-if="formData.selectedDataset === DataSource.RS"
                v-model:decisions="formData.decisions"
                v-model:opinions="formData.opinions"
            />

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
                <TextInput
                    label="Language (comma-separated)"
                    fieldId="language"
                    v-model:value="formData.languageInput"
                    placeholder="e.g., ENG, FRE"
                />

                <!-- Importance Levels -->
                <ImportanceLevelSelector 
                    v-model:importance="formData.importance"
                />
            </template>
        </template>

        <!-- Action Buttons -->
        <div class="form-actions">
            <button type="button" @click="emit('handleReset')" :disabled="loading" class="btn btn-secondary">
                Reset
            </button>
            <button type="submit" :disabled="loading || (!formData.keywords.length && !formData.eclis.trim())" class="btn btn-primary">
                {{ loading ? 'Searching...' : 'Search Documents' }}
            </button>
        </div>

        <!-- Warning Message -->
        <div v-if="formData.keywords.length === 0 && !formData.eclis.trim()" class="warning-message">
            <strong>*</strong> Required: Please enter either keywords or ECLIs to search
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataSource } from 'legal-docs-client'
import DatasetSelector from '../blocks/DatasetSelector.vue'
import KeywordsInput from '../blocks/KeywordsInput.vue'
import EclisInput from '../blocks/EclisInput.vue'
import ArticleField from '../blocks/ArticleField.vue'
import TextInput from '../blocks/TextInput.vue'
import DateRange from '../blocks/DateRange.vue'
import NetworkDegrees from '../blocks/NetworkDegrees.vue'
import InstancesSelector from '../blocks/InstancesSelector.vue'
import DomainsSelector from '../blocks/DomainsSelector.vue'
import DocTypeSelector from '../blocks/DocTypeSelector.vue'
import ImportanceLevelSelector from '../blocks/ImportanceLevelSelector.vue'

const props = defineProps<{
    formData: any
    loading: boolean
}>()

const emit = defineEmits<{
    'submit': []
    'handleReset': []
}>()

const currentKeyword = ref('')
const showAdvanced = ref(false)

const handleSubmit = () => emit('submit')
</script>

<style scoped>
.form-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
}

.form-group-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

.form-group-row .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group-row label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.form-group-row input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
}

.form-group-row input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.toggle-advanced {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    background: #f9fafb;
    cursor: pointer;
    border-radius: 4px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
    transition: all 0.2s;
}

.toggle-advanced:hover {
    background: #f3f4f6;
    border-color: #ccc;
}

.label-with-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.btn {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
}

.btn-secondary {
    background: white;
    color: #333;
    border-color: #ddd;
}

.btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #999;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.help-text {
    font-size: 12px;
    color: #666;
    margin: 8px 0 0 0;
    font-style: italic;
}

@media (max-width: 640px) {
    .form-group-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column-reverse;
    }
}
</style>