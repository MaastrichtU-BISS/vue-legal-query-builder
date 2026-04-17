<template>
    <div class="form-group">
        <label v-if="label" :for="fieldId">{{ label }}</label>
        <input :id="fieldId" v-model="value"
            type="text" :placeholder="placeholder" />
    </div>
</template>

<script setup lang="ts">
const value = defineModel<string>('value')

defineProps<{
    label?: string
    fieldId: string
    placeholder: string
}>()
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
