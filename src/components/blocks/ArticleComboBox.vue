<template>
    <div class="form-group">
        <div class="label-with-toggle">
            <label :for="`article-${fieldName}`">{{ label }}</label>
            <button type="button" @click="isIntersect = !isIntersect" class="intersect-toggle"
                :title="isIntersect ? 'AND mode: All required' : 'OR mode: Any matches'">
                {{ isIntersect ? 'AND' : 'OR' }}
            </button>
        </div>

        <div class="combobox" @focusout="handleFocusOut">
            <input :id="`article-${fieldName}`" v-model="searchQuery" type="text" :placeholder="placeholder"
                autocomplete="off" @focus="showResults = true" />

            <div v-if="showResults" class="results-container">
                <div v-if="filteredArticles.length > 0">
                    <div v-for="article in filteredArticles" :key="article.number" class="result-item"
                        @mousedown.prevent="toggleArticle(article.number)">
                        <input type="checkbox" :checked="isSelected(article.number)" class="article-checkbox"
                            @mousedown.prevent @click.prevent />
                        <label class="checkbox-label">Art. {{ article.number }} - {{ article.title }}</label>
                    </div>
                </div>
                <div v-else class="no-results-message">No articles found matching your search</div>
            </div>
        </div>

        <div v-if="selected.length > 0" class="selected-articles-container">
            <div v-for="articleNumber in selected" :key="articleNumber" class="chip">
                <span class="chip-content">{{ articleLabel(articleNumber) }}</span>
                <button type="button" @click="toggleArticle(articleNumber)" class="chip-remove"
                    aria-label="Remove article">
                    ×
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ECHR_ARTICLES_OPTIONS } from 'legal-docs-types'

const selected = defineModel<string[]>('selected', { default: () => [] })
const isIntersect = defineModel<boolean>('isIntersect')

defineProps<{
    label: string
    fieldName: string
    placeholder?: string
}>()

const searchQuery = ref('')
const showResults = ref(false)

const filteredArticles = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return ECHR_ARTICLES_OPTIONS
    return ECHR_ARTICLES_OPTIONS.filter(
        (article) =>
            article.number.toLowerCase().includes(query) ||
            article.title.toLowerCase().includes(query)
    )
})

const isSelected = (articleNumber: string): boolean => {
    return selected.value.includes(articleNumber)
}

const toggleArticle = (articleNumber: string) => {
    const index = selected.value.indexOf(articleNumber)
    if (index > -1) {
        selected.value = selected.value.filter((n) => n !== articleNumber)
    } else {
        selected.value = [...selected.value, articleNumber]
    }
}

const articleLabel = (articleNumber: string): string => {
    const article = ECHR_ARTICLES_OPTIONS.find((a) => a.number === articleNumber)
    return article ? `Art. ${article.number} - ${article.title}` : articleNumber
}

const handleFocusOut = (event: FocusEvent) => {
    const container = event.currentTarget as HTMLElement
    const nextTarget = event.relatedTarget as Node | null
    if (!nextTarget || !container.contains(nextTarget)) {
        showResults.value = false
    }
}
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.form-group {
    margin-bottom: 16px;
}

.label-with-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.intersect-toggle {
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #ddd;
    background: #f9fafb;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.2s;
    color: #666;
    min-width: 40px;
}

.intersect-toggle:hover {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
}

.combobox {
    position: relative;
}

.combobox input[type="text"] {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
}

.combobox input[type="text"]:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.results-container {
    border: 1px solid #ddd;
    margin-top: 8px;
    max-height: 260px;
    overflow-y: auto;
    background: #f9fafb;
    border-radius: 4px;
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

.article-checkbox {
    cursor: pointer;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.checkbox-label {
    font-weight: 500;
    color: #1f2937;
    font-size: 13px;
    cursor: pointer;
    flex: 1;
}

.no-results-message {
    padding: 16px 12px;
    text-align: center;
    color: #999;
    font-size: 13px;
}

.selected-articles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.chip-content {
    font-weight: 500;
}
</style>
