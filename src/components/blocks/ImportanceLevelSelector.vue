<template>
    <div class="form-group">
        <label>Importance Level</label>
        <div class="checkbox-group">
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="importance.includes(1)"
                    @change="toggleLevel(1)" 
                />
                Level 1 (highest)
            </label>
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="importance.includes(2)"
                    @change="toggleLevel(2)" 
                />
                Level 2
            </label>
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="importance.includes(3)"
                    @change="toggleLevel(3)" 
                />
                Level 3
            </label>
            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    :checked="importance.includes(4)"
                    @change="toggleLevel(4)" 
                />
                Level 4 (lowest)
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
const importance = defineModel<number[]>('importance', { default: () => [] })

const toggleLevel = (level: number) => {
    const index = importance.value.indexOf(level)
    if (index > -1) {
        importance.value = importance.value.filter(l => l !== level)
    } else {
        importance.value = [...importance.value, level]
    }
}
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
