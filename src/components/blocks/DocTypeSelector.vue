<template>
    <div class="form-group">
        <label>Document Types</label>
        <div class="checkbox-group">
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="decisions"
                    @change="decisions = !decisions" 
                />
                Decision
            </label>
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="opinions"
                    @change="opinions = !opinions" 
                />
                Opinion
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
const decisions = defineModel<boolean>('decisions')
const opinions = defineModel<boolean>('opinions')
</script>

<style scoped>
.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 8px;
}

.form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 14px;
}

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
