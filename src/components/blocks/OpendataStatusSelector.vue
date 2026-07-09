<template>
    <div class="form-group">
        <label>Opendata Status</label>
        <div class="button-group">
            <button type="button" v-for="option in options" :key="option.value"
                @click="selectedValue = selectedValue === option.value ? undefined : option.value"
                :class="{ 'active': selectedValue === option.value }">
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { OpendataStatusFilter } from 'legal-docs-client'

const selectedValue = defineModel<OpendataStatusFilter | undefined>('selectedValue')

const options: { value: OpendataStatusFilter; label: string }[] = [
    { value: 'public', label: 'Public' },
    { value: 'depublicated', label: 'Depublicated' },
    { value: 'all', label: 'All' },
]
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.button-group {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
}

button:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
}

button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}
</style>
