<template>
    <div class="form-group">
        <label v-if="label" for="eclis">{{ label }} <span v-if="required" class="required-asterisk">*</span></label>
        <input id="eclis" v-model="eclis"
            type="text" placeholder="e.g., ECLI:NL:HR:2020:123, ECLI:NL:HR:2020:456" />
    </div>
</template>

<script setup lang="ts">
const eclis = defineModel<string>('eclis')

defineProps<{
    label?: string
    required?: boolean
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
