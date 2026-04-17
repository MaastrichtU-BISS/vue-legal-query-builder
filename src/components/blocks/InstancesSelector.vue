<template>
    <div class="form-group">
        <button type="button" @click="isOpen = !isOpen" class="toggle-advanced">
            {{ isOpen ? '▼' : '▶' }} Instances
        </button>
        <div v-if="isOpen" class="hierarchical-checkboxes">
            <div v-for="item in hierarchyItems" :key="item.value" class="hierarchy-level"
                :style="{ marginLeft: item.level * 20 + 'px' }">
                <label class="checkbox-label">
                    <input type="checkbox" :checked="selectedValues.includes(item.value)"
                        @change="toggleItemSelection(item.value, item.children || [])" />
                    {{ item.label }}
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { INSTANCES_OPTIONS } from 'legal-docs-client'

interface HierarchyItem {
    value: string
    label: string
    level: number
    children?: string[]
}

const selectedValues = defineModel<string[]>('selectedValues', { default: () => [] })
const isOpen = ref(false)

const buildHierarchy = (options: any[]): HierarchyItem[] => {
    const nodes: HierarchyItem[] = []
    
    if (Array.isArray(options)) {
        const items = options as any[]
        items.forEach((item) => {
            let value: string
            let label: string
            let level: number = 0
            let children: string[] | undefined = undefined
            
            if (typeof item === 'string') {
                value = item
                label = item
            } else if (typeof item === 'object' && item !== null) {
                const anyItem = item as any
                if (anyItem.name) {
                    value = anyItem.name
                    label = anyItem.name
                    level = anyItem.level || 0
                    if (anyItem.children && Array.isArray(anyItem.children)) {
                        children = anyItem.children.map((child: any, index: number) => {
                            const childValue = typeof child === 'string' ? child : (child.name || child.value || String(child))
                            return `${value}__${index}__${childValue}`
                        })
                    }
                } else {
                    const keys = Object.keys(anyItem)
                    if (keys.length > 0) {
                        const key = keys[0]
                        value = key
                        label = key
                        const childData = anyItem[key]
                        if (Array.isArray(childData)) {
                            children = childData.map((child: any, index: number) => {
                                const childValue = typeof child === 'string' ? child : (child.name || child.value || String(child))
                                return `${key}__${index}__${childValue}`
                            })
                        }
                    } else {
                        return
                    }
                }
            } else {
                return
            }
            
            const node: HierarchyItem = { value, label, level, ...(children && { children }) }
            nodes.push(node)
            
            if (children) {
                children.forEach((childId) => {
                    if (!nodes.find(n => n.value === childId)) {
                        const childLabel = childId.split('__').pop() || childId
                        nodes.push({ value: childId, label: childLabel, level: level + 1 })
                    }
                })
            }
        })
    }
    
    return nodes.length > 0 ? nodes : []
}

const hierarchyItems = computed(() => buildHierarchy(INSTANCES_OPTIONS))

const toggleItemSelection = (value: string, children: string[]) => {
    const index = selectedValues.value.indexOf(value)
    if (index > -1) {
        selectedValues.value = selectedValues.value.filter(v => v !== value)
        children.forEach(child => {
            selectedValues.value = selectedValues.value.filter(v => v !== child)
        })
    } else {
        const filtered = children.filter(c => !selectedValues.value.includes(c))
        selectedValues.value = [...selectedValues.value, value, ...filtered]
    }
}
</script>

<style>
@import '../../styles/shared.css';
</style>

<style scoped>
.toggle-advanced {
    padding: 10px 12px;
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    font-weight: 500;
    transition: all 0.2s;
}

.toggle-advanced:hover {
    background-color: #f5f5f5;
    border-color: #999;
}

.hierarchical-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 8px;
    background-color: #fafafa;
    border: 1px solid #ddd;
    border-radius: 4px;
    border-top: none;
}

.hierarchy-level {
    display: flex;
    align-items: center;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.checkbox-label input[type="checkbox"] {
    cursor: pointer;
}
</style>
