<template>
    <div class="form-group">
        <div class="label-with-toggle">
            <label :for="`article-${fieldName}`">{{ label }}</label>
            <button type="button" @click="isIntersect = !isIntersect" class="intersect-toggle"
                :title="isIntersect ? 'AND mode: All required' : 'OR mode: Any matches'">
                {{ isIntersect ? 'AND' : 'OR' }}
            </button>
        </div>
        <input :id="`article-${fieldName}`" v-model="value"
            type="text" :placeholder="placeholder" />
    </div>
</template>

<script setup lang="ts">
const value = defineModel<string>('value')
const isIntersect = defineModel<boolean>('isIntersect')

defineProps<{
    label: string
    fieldName: string
    placeholder: string
}>()
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

input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
}

input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
