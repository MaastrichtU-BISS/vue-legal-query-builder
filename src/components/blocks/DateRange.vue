<template>
    <div class="form-group-row">
        <div class="form-group">
            <label for="dateStart">Start Date</label>
            <input id="dateStart" v-model="dateStart" type="date" />
        </div>
        <div class="form-group">
            <label for="dateEnd">End Date</label>
            <input id="dateEnd" v-model="dateEnd" type="date" />
        </div>
    </div>
</template>

<script setup lang="ts">
const dateStart = defineModel<string>('dateStart')
const dateEnd = defineModel<string>('dateEnd')
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.form-group-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

input {
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

@media (max-width: 640px) {
    .form-group-row {
        grid-template-columns: 1fr;
    }
}
</style>
