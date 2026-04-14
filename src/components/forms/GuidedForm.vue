<template>
    <div class="guided-form-container">
        <!-- Goals View -->
        <template v-if="selectedGoalIndex === null">
            <div class="goals-view">
                <div class="goals-grid">
                    <div 
                        v-for="(goal, index) in props.guidedStructure?.goals || []" 
                        :key="index"
                        class="goal-card"
                        @click="selectGoal(index)"
                    >
                        <component v-if="goal.icon" :is="getIconComponent(goal.icon)" class="goal-icon" />
                        <h4 class="goal-title">{{ goal.title }}</h4>
                        <p class="goal-description">{{ goal.description }}</p>
                        <p class="goal-steps-count">{{ goal.steps.length }} steps</p>
                    </div>
                </div>
            </div>
        </template>

        <!-- Stepper View -->
        <template v-else>
            <div class="stepper-view">
                <button @click="goBackToGoals" class="btn-back">
                    <ArrowLeft :size="16" />
                    Back to Goals
                </button>
                
                <h3 class="view-title">{{ currentGoal.title }}</h3>
                <p class="goal-description">{{ currentGoal.description }}</p>

                <!-- Stepper Progress -->
                <div class="steps-container">
                    <div 
                        v-for="(step, index) in currentGoal.steps" 
                        :key="index"
                        class="step-indicator"
                        :class="{ 
                            active: index === currentStepIndex,
                            completed: index < currentStepIndex
                        }"
                    >
                        <div class="step-number">
                            {{ index < currentStepIndex ? '✓' : index + 1 }}
                        </div>
                        <span class="step-label">{{ step.title }}</span>
                    </div>
                </div>

                <!-- Current Step Content -->
                <div class="step-content">
                    <div class="step-header">
                        <h4>{{ currentStep.title }}</h4>
                        <span v-if="currentStep.required" class="required-badge">Required</span>
                    </div>
                    <p class="step-description">{{ currentStep.description }}</p>

                    <!-- Dynamic Block Component -->
                    <div class="block-wrapper">
                        <component 
                            :is="getBlockComponent(currentStep.blockType)"
                            v-bind="getBlockProps(currentStep)"
                        />
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="button-container">
                    <button 
                        @click="previousStep" 
                        :disabled="currentStepIndex === 0"
                        class="btn btn-secondary"
                    >
                        <ArrowLeft :size="16" />
                        Previous
                    </button>
                    <button 
                        v-if="currentStepIndex < currentGoal.steps.length - 1"
                        @click="nextStep" 
                        class="btn btn-primary"
                    >
                        Next
                        <ArrowRight :size="16" />
                    </button>
                    <button 
                        v-else
                        @click="submitGoal" 
                        class="btn btn-primary"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import type { GuidedStructure, Step, Goal } from '../types'
import { BlockType } from '../types'

// Block components
import DatasetSelector from '../blocks/DatasetSelector.vue'
import KeywordsInput from '../blocks/KeywordsInput.vue'
import EclisInput from '../blocks/EclisInput.vue'
import ArticleField from '../blocks/ArticleField.vue'
import TextInput from '../blocks/TextInput.vue'
import DateRange from '../blocks/DateRange.vue'
import NetworkDegrees from '../blocks/NetworkDegrees.vue'
import InstancesSelector from '../blocks/InstancesSelector.vue'
import DomainsSelector from '../blocks/DomainsSelector.vue'
import DocTypeSelector from '../blocks/DocTypeSelector.vue'
import ImportanceLevelSelector from '../blocks/ImportanceLevelSelector.vue'

interface Props {
    guidedStructure?: GuidedStructure
    formData: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'submit': []
}>()

const getIconComponent = (iconName: string) => {
    return defineAsyncComponent(() => {
        // Remove lucide- prefix if present
        let name = iconName.replace(/^lucide-/, '')
        // Convert kebab-case to PascalCase
        name = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
        return import('lucide-vue-next').then(module => module[name] || null)
    })
}

// State management
const selectedGoalIndex = ref<number | null>(null)
const currentStepIndex = ref(0)

// Computed properties
const currentGoal = computed((): Goal | undefined => {
    if (selectedGoalIndex.value === null) return undefined
    return props.guidedStructure?.goals[selectedGoalIndex.value]
})

const currentStep = computed((): Step | undefined => {
    return currentGoal.value?.steps[currentStepIndex.value]
})

// Methods
const selectGoal = (index: number) => {
    selectedGoalIndex.value = index
    currentStepIndex.value = 0
}

const goBackToGoals = () => {
    selectedGoalIndex.value = null
    currentStepIndex.value = 0
}

const previousStep = () => {
    if (currentStepIndex.value > 0) {
        currentStepIndex.value--
    }
}

const nextStep = () => {
    if (!currentGoal.value) return
    if (currentStepIndex.value < currentGoal.value.steps.length - 1) {
        currentStepIndex.value++
    }
}

const submitGoal = () => {
    emit('submit')
}

const getBlockComponent = (blockType: BlockType) => {
    const componentMap: Record<BlockType, any> = {
        [BlockType.ARTICLE_FIELD]: ArticleField,
        [BlockType.DATASET_SELECTOR]: DatasetSelector,
        [BlockType.DATE_RANGE]: DateRange,
        [BlockType.DOC_TYPE_SELECTOR]: DocTypeSelector,
        [BlockType.DOMAINS_SELECTOR]: DomainsSelector,
        [BlockType.ECLIS_INPUT]: EclisInput,
        [BlockType.IMPORTANCE_LEVEL_SELECTOR]: ImportanceLevelSelector,
        [BlockType.INSTANCES_SELECTOR]: InstancesSelector,
        [BlockType.KEYWORDS_INPUT]: KeywordsInput,
        [BlockType.NETWORK_DEGREES]: NetworkDegrees,
        [BlockType.TEXT_INPUT]: TextInput,
    }
    return componentMap[blockType]
}

const getBlockProps = (step: Step): any => {
    const baseProps: any = {}

    switch (step.blockType) {
        case BlockType.ARTICLE_FIELD:
            return {
                ...baseProps,
                label: step.title,
                fieldName: 'articleField',
                modelValue: props.formData.articleViolatedInput,
                'onUpdate:modelValue': (val: string) => { props.formData.articleViolatedInput = val },
                placeholder: step.placeholder
            }

        case BlockType.DATASET_SELECTOR:
            return {
                ...baseProps,
                selectedDataset: props.formData.selectedDataset,
                'onUpdate:selectedDataset': (val: string) => { props.formData.selectedDataset = val }
            }

        case BlockType.DATE_RANGE:
            return {
                ...baseProps,
                dateStart: props.formData.dateStart,
                'onUpdate:dateStart': (val: string) => { props.formData.dateStart = val },
                dateEnd: props.formData.dateEnd,
                'onUpdate:dateEnd': (val: string) => { props.formData.dateEnd = val }
            }

        case BlockType.DOC_TYPE_SELECTOR:
            return {
                ...baseProps,
                decisions: props.formData.decisions,
                'onUpdate:decisions': (val: boolean) => { props.formData.decisions = val },
                opinions: props.formData.opinions,
                'onUpdate:opinions': (val: boolean) => { props.formData.opinions = val }
            }

        case BlockType.DOMAINS_SELECTOR:
            return {
                ...baseProps,
                selectedValues: props.formData.selectedDomains,
                'onUpdate:selectedValues': (val: string[]) => { props.formData.selectedDomains = val }
            }

        case BlockType.ECLIS_INPUT:
            return {
                ...baseProps,
                eclis: props.formData.eclis,
                'onUpdate:eclis': (val: string) => { props.formData.eclis = val }
            }

        case BlockType.IMPORTANCE_LEVEL_SELECTOR:
            return {
                ...baseProps,
                importance: props.formData.importance,
                'onUpdate:importance': (val: number[]) => { props.formData.importance = val }
            }

        case BlockType.INSTANCES_SELECTOR:
            return {
                ...baseProps,
                selectedValues: props.formData.selectedInstances,
                'onUpdate:selectedValues': (val: string[]) => { props.formData.selectedInstances = val }
            }

        case BlockType.KEYWORDS_INPUT:
            return {
                ...baseProps,
                keywords: props.formData.keywords,
                'onUpdate:keywords': (val: string[]) => { props.formData.keywords = val },
                currentKeyword: props.formData.currentKeyword,
                'onUpdate:currentKeyword': (val: string) => { props.formData.currentKeyword = val }
            }

        case BlockType.NETWORK_DEGREES:
            return {
                ...baseProps,
                degreesSource: props.formData.degreesSource,
                'onUpdate:degreesSource': (val: number) => { props.formData.degreesSource = val },
                degreesTarget: props.formData.degreesTarget,
                'onUpdate:degreesTarget': (val: number) => { props.formData.degreesTarget = val }
            }

        case BlockType.TEXT_INPUT:
            return {
                ...baseProps,
                label: step.title,
                fieldId: step.title.toLowerCase().replace(/\s+/g, '-'),
                value: props.formData.articleViolatedInput,
                'onUpdate:value': (val: string) => { props.formData.articleViolatedInput = val },
                placeholder: step.placeholder
            }

        default:
            return baseProps
    }
}
</script>

<style scoped>
.guided-form-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

/* Goals View */
.goals-view {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.view-title {
    font-size: 20px;
    font-weight: 600;
    color: #243056;
    margin-top: 10px;
    margin-bottom: 0;
}

.goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
}

.goal-card {
    padding: 20px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
}

.goal-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
}

.goal-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    color: #3b82f6;
    stroke-width: 1.5;
}

.goal-title {
    font-size: 16px;
    font-weight: 600;
    color: #243056;
    margin-bottom: 8px;
}

.goal-description {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.5;
}

.goal-steps-count {
    font-size: 12px;
    color: #999;
    font-weight: 500;
}

/* Stepper View */
.stepper-view {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.btn-back {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: all 0.2s;
}

.btn-back:hover {
    background: #f3f4f6;
    border-color: #bbb;
}

.steps-container {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 8px 0;
    margin: auto;
}

.step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 80px;
    opacity: 0.5;
    transition: all 0.3s;
}

.step-indicator.active {
    opacity: 1;
}

.step-indicator.completed {
    opacity: 1;
}

.step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #ddd;
    font-weight: 600;
    font-size: 14px;
    background: white;
    color: #666;
    transition: all 0.3s;
}

.step-indicator.active .step-number {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
}

.step-indicator.completed .step-number {
    border-color: #10b981;
    background: #10b981;
    color: white;
}

.step-label {
    font-size: 12px;
    color: #666;
    text-align: center;
    word-break: break-word;
}



.step-content {
    padding: 24px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.step-header h4 {
    font-size: 16px;
    font-weight: 600;
    color: #243056;
    margin: 0;
}

.required-badge {
    padding: 2px 8px;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
}

.step-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.6;
}

.block-wrapper {
    margin-bottom: 16px;
}

.button-container {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.btn-primary:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
}

.btn-secondary {
    background: white;
    color: #333;
    border-color: #ddd;
}

.btn-secondary:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #bbb;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
