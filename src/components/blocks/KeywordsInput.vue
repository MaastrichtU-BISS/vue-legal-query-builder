<template>
    <div class="form-group">
        <label for="keywords">Keywords <span class="required-asterisk">*</span></label>
        <div class="chips-container">
            <span v-for="(keyword, index) in keywords" :key="index" class="chip">
                {{ keyword }}
                <button type="button" @click="keywords = keywords.toSpliced(index, 1)" class="chip-remove">
                    ×
                </button>
            </span>
            <input v-model="currentKeyword" 
                @keydown="handleKeywordKeydown"
                @blur="addKeywordFromInput"
                type="text"
                placeholder="Type and press Enter, or separate with commas" 
                class="chip-input" 
                id="keywords" />
        </div>
    </div>
</template>

<script setup lang="ts">
const keywords = defineModel<string[]>('keywords', { default: () => [] })
const currentKeyword = defineModel<string>('currentKeyword', { default: '' })

const addKeywordFromInput = () => {
    const keyword = currentKeyword.value.trim()
    if (keyword) {
        // Handle comma-separated keywords
        const newKeywords = keyword.split(',').map((k: string) => k.trim()).filter((k: string) => k)
        const updated = [...keywords.value]
        newKeywords.forEach((newKeyword: string) => {
            if (!updated.includes(newKeyword)) {
                updated.push(newKeyword)
            }
        })
        keywords.value = updated
        currentKeyword.value = ''
    }
}

const handleKeywordKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        addKeywordFromInput()
    } else if (event.key === ',') {
        event.preventDefault()
        addKeywordFromInput()
    } else if (event.key === 'Backspace' && currentKeyword.value.length === 0 && keywords.value.length > 0) {
        event.preventDefault()
        keywords.value = keywords.value.slice(0, -1)
    }
}
</script>

<style scoped>
.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
}

label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fafafa;
    align-items: center;
}

.chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border-radius: 20px;
    font-size: 14px;
}

.chip-remove {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    transition: all 0.2s;
}

.chip-remove:hover {
    background: rgba(0, 0, 0, 0.2);
}

.chip-input {
    flex: 1;
    min-width: 150px;
    border: none;
    background: transparent;
    font-size: 14px;
    font-family: inherit;
    padding: 6px 0;
}

.chip-input:focus {
    outline: none;
}

.required-asterisk {
    color: #ef4444;
}
</style>
