<template>
    <div class="form-group">
        <label>Dataset</label>
        <div class="button-group">
            <button type="button" @click="selectedDataset = DataSource.RS"
                :class="{ 'active': selectedDataset === DataSource.RS }">
                Rechtspraak
            </button>
            <button type="button" @click="selectedDataset = DataSource.ECHR" disabled
                :class="{ 'active': selectedDataset === DataSource.ECHR }">
                ECHR
            </button>
            <button type="button" disabled
                :class="{ 'active': selectedDataset === DataSource.CJEU }">
                CJEU
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DataSource } from 'legal-docs-client'

const selectedDataset = defineModel<DataSource>('selectedDataset')
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.button-group {
    display: flex;
    gap: 10px;
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

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
