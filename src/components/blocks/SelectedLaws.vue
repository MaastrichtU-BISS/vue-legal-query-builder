<template>
    <div class="form-group selected-laws">
        <label v-if="label" for="laws-search">{{ label }} <span v-if="required" class="required-asterisk">*</span></label>
        <div class="search-container">
            <input
                id="laws-search"
                v-model="searchQuery"
                type="text"
                placeholder="e.g., Art. 7:669 BW, Art. 7:671b BW"
                class="laws-search-input"
                @input="handleSearch"
            />
        </div>

        <!-- Loading indicator -->
        <!-- Results list -->
        <div v-if="showResults" class="results-container">
            <div v-if="loading" class="loading">Loading laws...</div>
            <div v-if="!loading && results.length > 0">
                <div v-for="item in results" :key="item.bwb_id" class="result-item">
                    <input
                        :id="`law-${item.bwb_id}`"
                        type="checkbox"
                        :checked="isSelected(item)"
                        @change="toggleSelection(item)"
                        class="law-checkbox"
                    />
                    <label :for="`law-${item.bwb_id}`" class="checkbox-label">
                        <span v-if="item.title" class="law-title">{{ item.title }}</span>
                        <span class="law-ids">{{ item.bwb_id }} - {{ item.bwb_label_id }}</span>
                    </label>
                </div>
            </div>
            <div v-if="!loading && results.length === 0 && searchQuery" class="no-results-message">
                No laws found matching your search
            </div>
        </div>

        <!-- Selected laws (chips) -->
        <div v-if="selectedLaws.length > 0" class="selected-laws-container">
            <div v-for="(item, index) in selectedLawsDisplay" :key="item.bwb_id" class="law-chip">
                <span class="chip-content">
                    <span v-if="item.title" class="chip-title">{{ item.title }}</span>
                    <span class="chip-ids">{{ item.bwb_id }} - {{ item.bwb_label_id }}</span>
                </span>
                <button
                    type="button"
                    @click="removeLaw(index)"
                    class="chip-remove"
                    aria-label="Remove law"
                >
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createLegalDocsClient } from 'legal-docs-client'
import type { LegalDocsClient, BWBItem } from 'legal-docs-client'


const props = defineProps<{
    label?: string
    required?: boolean
}>()

const selectedLaws = defineModel<string[]>('selectedLaws', { default: () => [] })

const client = ref<LegalDocsClient | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const results = ref<BWBItem[]>([])
const showResults = ref(false)

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Initialize the client on mount
onMounted(() => {
    client.value = createLegalDocsClient({})
})

const selectedLawsDisplay = computed(() => {
    return selectedLaws.value.map(item => {
        const parts = item.split('|')
        return {
            bwb_id: parts[0],
            bwb_label_id: parts[1],
            title: parts[2] || ''
        }
    })
})

const handleSearch = async () => {
    const query = searchQuery.value.trim()

    // Clear debounce timer
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    // Hide results if query is empty
    if (!query) {
        showResults.value = false
        results.value = []
        return
    }

    // Show loading state
    showResults.value = true
    loading.value = true

    // Debounce the fetch call
    debounceTimer = setTimeout(async () => {
        if (!client.value) return
        try {
            const data = await client.value.fetchLaws(query)
            console.log(results.value)
            results.value = data || []
        } catch (error) {
            // Silently ignore errors as per requirement
            results.value = []
        } finally {
            loading.value = false
        }
    }, 300)
}

const isSelected = (item: BWBItem): boolean => {
    const key = `${item.bwb_id}|${item.bwb_label_id}|${item.title || ''}`
    return selectedLaws.value.includes(key)
}

const toggleSelection = (item: BWBItem) => {
    const key = `${item.bwb_id}|${item.bwb_label_id}|${item.title || ''}`
    const index = selectedLaws.value.indexOf(key)

    if (index > -1) {
        selectedLaws.value.splice(index, 1)
    } else {
        selectedLaws.value.push(key)
    }
}

const removeLaw = (index: number) => {
    selectedLaws.value.splice(index, 1)
}
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.search-container {
    position: relative;
}

.laws-search-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
}

.laws-search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.loading {
    padding: 16px 12px;
    color: #666;
    font-size: 13px;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
}

.results-container {
    border: 1px solid #ddd;
    margin-top: 8px;
    max-height: 300px;
    overflow-y: auto;
    background: #f9fafb;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: background-color 0.15s;
}

.result-item:hover {
    background-color: #f3f4f6;
}

.result-item:last-child {
    border-bottom: none;
}

.law-checkbox {
    cursor: pointer;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.checkbox-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    cursor: pointer;
    flex: 1;
}

.law-title {
    font-weight: 600;
    color: #1f2937;
    font-size: 13px;
}

.law-ids {
    font-weight: 500;
    color: #666;
    font-size: 12px;
}

.no-results-message {
    padding: 16px 12px;
    text-align: center;
    color: #999;
    font-size: 13px;
}

.selected-laws-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.chip-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-weight: 500;
}

.chip-title {
    font-weight: 600;
    font-size: 13px;
    color: #1e40af;
}

.chip-ids {
    font-weight: 400;
    font-size: 12px;
    opacity: 0.85;
}
</style>
