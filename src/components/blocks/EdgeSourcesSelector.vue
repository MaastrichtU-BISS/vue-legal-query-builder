<template>
    <div class="form-group">
        <label>Edge Sources</label>
        <div class="checkbox-group">
            <label v-for="option in options" :key="option.value" class="checkbox-label">
                <input type="checkbox" :checked="selectedValues.includes(option.value)"
                    @change="toggle(option.value)" />
                {{ option.label }}
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { RechtspraakEdgeSource } from 'legal-docs-client'

const selectedValues = defineModel<RechtspraakEdgeSource[]>('selectedValues', { default: () => [] })

const options: { value: RechtspraakEdgeSource; label: string }[] = [
    { value: 'body-cite', label: 'Body citation' },
    { value: 'formal-relation', label: 'Formal relation' },
    { value: 'replaces', label: 'Replaces' },
]

const toggle = (value: RechtspraakEdgeSource) => {
    const index = selectedValues.value.indexOf(value)
    if (index > -1) {
        selectedValues.value = selectedValues.value.filter(v => v !== value)
    } else {
        selectedValues.value = [...selectedValues.value, value]
    }
}
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
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
</style>
