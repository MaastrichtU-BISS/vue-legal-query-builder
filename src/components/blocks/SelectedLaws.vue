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
            <div v-if="!searchAvailable" class="no-results-message">
                Law search is not available in this application.
            </div>
            <div
                v-else-if="!loading && results.length === 0 && searchQuery"
                class="no-results-message"
            >
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
import { ref, computed, watch } from 'vue'
import type { BWBItem } from 'legal-docs-types'
import { useHostCallbacks } from '../hostCallbacks'


const props = defineProps<{
    label?: string
    required?: boolean
}>()

const selectedLaws = defineModel<string[]>('selectedLaws', { default: () => [] })

// The host does the searching. This package neither calls the API nor holds a
// credential: an earlier version read a token from import.meta.env, which
// compiled it into this package's published bundle and into every application
// that installed it.
const { searchLaws } = useHostCallbacks()
const searchAvailable = computed(() => typeof searchLaws === 'function')
const searchQuery = ref('')
const loading = ref(false)
const results = ref<BWBItem[]>([])
const showResults = ref(false)
const selectedLawsData = ref<BWBItem[]>([])

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Sync selectedLawsData when selectedLaws changes externally (e.g., external updates)
watch(() => selectedLaws.value, (newVal) => {
    // Keep selectedLawsData in sync by preserving existing items and removing deleted ones
    const newKeys = new Set(newVal)
    
    // Remove items that are no longer in selectedLaws
    selectedLawsData.value = selectedLawsData.value.filter(item => 
        newKeys.has(`${item.bwb_id}|${item.bwb_label_id}`)
    )
    
    // Reorder to match selectedLaws order
    selectedLawsData.value.sort((a, b) => {
        const aKey = `${a.bwb_id}|${a.bwb_label_id}`
        const bKey = `${b.bwb_id}|${b.bwb_label_id}`
        return newVal.indexOf(aKey) - newVal.indexOf(bKey)
    })
}, { deep: true })

const selectedLawsDisplay = computed(() => {
    // Return cached data which is now reliably persisted across component remounts
    return selectedLawsData.value
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

    // Nothing to search with: the host did not supply onSearchLaws, and the
    // template says so rather than leaving a spinner running forever.
    if (!searchAvailable.value) {
        loading.value = false
        results.value = []
        return
    }

    // Debounce the fetch call
    debounceTimer = setTimeout(async () => {
        try {
            const data = await searchLaws!(query)
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
    const key = `${item.bwb_id}|${item.bwb_label_id}`
    return selectedLaws.value.includes(key)
}

const toggleSelection = (item: BWBItem) => {
    const key = `${item.bwb_id}|${item.bwb_label_id}`
    const index = selectedLaws.value.indexOf(key)

    if (index > -1) {
        selectedLaws.value.splice(index, 1)
        selectedLawsData.value.splice(index, 1)
    } else {
        selectedLaws.value.push(key)
        selectedLawsData.value.push(item)
    }
}

const removeLaw = (index: number) => {
    selectedLaws.value.splice(index, 1)
    selectedLawsData.value.splice(index, 1)
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
