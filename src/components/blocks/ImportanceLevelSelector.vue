<template>
    <div class="form-group">
        <label>Importance Level</label>
        <div class="button-group">
            <button type="button" v-for="level in [1, 2, 3, 4]" :key="level"
                @click="importance = importance === level ? undefined : level"
                :class="{ 'active': importance === level }">
                {{ level }}{{ level === 1 ? ' (highest)' : level === 4 ? ' (lowest)' : '' }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
const importance = defineModel<number | undefined>('importance')
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
