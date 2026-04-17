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
        <template v-else-if="currentGoal">
            <div class="stepper-view">
                <button @click="goBackToGoals" class="btn btn-secondary" :disabled="props.loading">
                    <Home :size="16" />
                    Query Selection
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
                            completed: index < currentStepIndex && isStepValid(step),
                            invalid: index < currentStepIndex && !isStepValid(step)
                        }"
                        @click="!props.loading && jumpToStep(index)"
                        :style="{ cursor: props.loading ? 'not-allowed' : 'pointer' }"
                    >
                        <div class="step-number">
                            {{ index < currentStepIndex ? (isStepValid(step) ? '✓' : '×') : index + 1 }}
                        </div>
                        <div class="step-title">{{ step.title }}</div>
                    </div>
                </div>

                <!-- Current Step Content -->
                <div class="step-content" v-if="currentStep">
                    <div v-for="(block, index) in currentStep.blocks" :key="index">
                        <div class="step-header">
                            <h4>{{ block.title }} <span v-if="block.required" class="required-asterisk">*</span></h4>
                        </div>
                        <p class="step-description">{{ block.description }}</p>

                        <!-- Dynamic Block Component (cached to preserve state across steps) -->
                        <div class="block-wrapper">
                            <KeepAlive>
                                <component 
                                    :is="getBlockComponent(block.type)"
                                    v-bind="getBlockProps(block)"
                                    :key="`${selectedGoalIndex}-${currentStepIndex}-${index}`"
                                />
                            </KeepAlive>
                        </div>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="button-container">
                    <button 
                        @click="previousStep" 
                        :disabled="currentStepIndex === 0 || props.loading"
                        class="btn btn-secondary"
                    >
                        <ArrowLeft :size="16" />
                        Previous
                    </button>
                    <button 
                        v-if="currentStepIndex < currentGoal.steps.length - 1"
                        @click="nextStep" 
                        :disabled="props.loading"
                        class="btn btn-primary"
                    >
                        Next
                        <ArrowRight :size="16" />
                    </button>
                    <button 
                        v-else
                        @click="handleSubmit" 
                        :disabled="props.loading"
                        class="btn btn-primary"
                    >
                        <Search :size="16" />   
                        Search Documents
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, KeepAlive } from 'vue'
import { ArrowLeft, ArrowRight, Home, Search } from 'lucide-vue-next'
import type { GuidedStructure, Step, Goal, Block } from '../types'
import { BlockType } from '../types'

// Block components
import DatasetSelector from '../blocks/DatasetSelector.vue'
import KeywordsInput from '../blocks/KeywordsInput.vue'
import EclisInput from '../blocks/EclisInput.vue'
import ArticleField from '../blocks/ArticleField.vue'
import FactsInput from '../blocks/FactsInput.vue'
import ReasoningInput from '../blocks/ReasoningInput.vue'
import DateRange from '../blocks/DateRange.vue'
import NetworkDegrees from '../blocks/NetworkDegrees.vue'
import InstancesSelector from '../blocks/InstancesSelector.vue'
import DomainsSelector from '../blocks/DomainsSelector.vue'
import SelectedLaws from '../blocks/SelectedLaws.vue'
import DocTypeSelector from '../blocks/DocTypeSelector.vue'
import ImportanceLevelSelector from '../blocks/ImportanceLevelSelector.vue'

interface Props {
    guidedStructure?: GuidedStructure
    formData: any
    loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'submit': [isValid: boolean]
    'handleReset': []
}>()

const getIconComponent = (iconName: string) => {
    return defineAsyncComponent(() => {
        // Remove lucide- prefix if present
        let name = iconName.replace(/^lucide-/, '')
        // Convert kebab-case to PascalCase
        name = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
        return import('lucide-vue-next').then(module => module[name] as any)
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

// Helper to check if a block is filled
function isBlockFilled(blockType: BlockType, data: any): boolean {
    switch (blockType) {
        case BlockType.KEYWORDS_INPUT:
            return data.keywords && data.keywords.length > 0
        case BlockType.ECLIS_INPUT:
            return data.eclis && data.eclis.trim().length > 0
        case BlockType.SELECTED_LAWS:
            return data.selectedLaws && data.selectedLaws.length > 0
        case BlockType.INSTANCES_SELECTOR:
            return data.selectedInstances && data.selectedInstances.length > 0
        case BlockType.DOMAINS_SELECTOR:
            return data.selectedDomains && data.selectedDomains.length > 0
        case BlockType.ARTICLE_FIELD:
            return (data.articleViolatedInput && data.articleViolatedInput.trim().length > 0) ||
                   (data.articleAppliedInput && data.articleAppliedInput.trim().length > 0) ||
                   (data.articleNonViolatedInput && data.articleNonViolatedInput.trim().length > 0)
        case BlockType.FACTS_INPUT:
            return data.facts && data.facts.trim().length > 0
        case BlockType.REASONING_INPUT:
            return data.reasoning && data.reasoning.trim().length > 0
        case BlockType.DOC_TYPE_SELECTOR:
            return data.decisions || data.opinions
        case BlockType.IMPORTANCE_LEVEL_SELECTOR:
            return data.importance && data.importance.length > 0
        default:
            return false
    }
}

// Validation logic for GuidedForm: for the current goal, each step must have at least one required block filled
const isValid = computed(() => {
    if (!currentGoal.value) return true
    
    for (const step of currentGoal.value.steps) {
        // Check if this step has any required blocks
        const requiredBlocks = step.blocks.filter(block => block.required)
        if (requiredBlocks.length === 0) continue // Skip steps with no required blocks
        
        // Check if at least one required block is filled
        const hasFilledRequiredBlock = requiredBlocks.some(block => 
            isBlockFilled(block.type as BlockType, props.formData)
        )
        
        if (!hasFilledRequiredBlock) {
            return false // Invalid: This step has unfilled required blocks
        }
    }
    return true // Current goal has all required blocks filled in each step
})

// Helper to check if a specific step is valid
function isStepValid(step: Step): boolean {
    const requiredBlocks = step.blocks.filter(block => block.required)
    if (requiredBlocks.length === 0) return true // No required blocks means step is valid
    
    // Check if at least one required block is filled
    return requiredBlocks.some(block => 
        isBlockFilled(block.type as BlockType, props.formData)
    )
}

// Methods

const goBackToGoals = () => {
    selectedGoalIndex.value = null
    currentStepIndex.value = 0
    emit('handleReset')
}

const selectGoal = (index: number) => {
    selectedGoalIndex.value = index
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

const jumpToStep = (index: number) => {
    if (!currentGoal.value) return
    if (index >= 0 && index < currentGoal.value.steps.length) {
        currentStepIndex.value = index
    }
}

const handleSubmit = () => {
    emit('submit', isValid.value)
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
        [BlockType.SELECTED_LAWS]: SelectedLaws,
        [BlockType.FACTS_INPUT]: FactsInput,
        [BlockType.REASONING_INPUT]: ReasoningInput,
    }
    return componentMap[blockType]
}

const getBlockProps = (block: Block): any => {
    const baseProps: any = {}

    switch (block.type) {
        case BlockType.ARTICLE_FIELD:
            return {
                ...baseProps,
                fieldName: 'articleField',
                modelValue: props.formData.articleViolatedInput,
                'onUpdate:modelValue': (val: string) => { props.formData.articleViolatedInput = val },
                placeholder: block.placeholder
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

        case BlockType.SELECTED_LAWS:
            return {
                ...baseProps,
                selectedLaws: props.formData.selectedLaws,
                'onUpdate:selectedLaws': (val: string[]) => { props.formData.selectedLaws = val },
                required: block.required
            }

        case BlockType.TEXT_INPUT:
            return {
                ...baseProps,
                fieldId: block.type.toLowerCase().replace(/\s+/g, '-'),
                value: props.formData.articleViolatedInput,
                'onUpdate:value': (val: string) => { props.formData.articleViolatedInput = val },
                placeholder: block.placeholder
            }

        case BlockType.TEXTAREA_INPUT:
            return {
                ...baseProps,
                fieldId: block.type.toLowerCase().replace(/\s+/g, '-'),
                value: props.formData.articleViolatedInput,
                'onUpdate:value': (val: string) => { props.formData.articleViolatedInput = val },
                placeholder: block.placeholder
            }

        case BlockType.FACTS_INPUT:
            return {
                ...baseProps,
                facts: props.formData.facts,
                'onUpdate:facts': (val: string) => { props.formData.facts = val },
                placeholder: block.placeholder
            }

        case BlockType.REASONING_INPUT:
            return {
                ...baseProps,
                reasoning: props.formData.reasoning,
                'onUpdate:reasoning': (val: string) => { props.formData.reasoning = val },
                placeholder: block.placeholder
            }

        default:
            return baseProps
    }
}
</script>

<style scoped>
@import '../../styles/shared.css';

.guided-form-container {
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
    gap: 8px;
}

.goal-card {
    padding: 20px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    max-width: 320px;
    justify-self: center;
}

.goal-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
}

.goal-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 12px;
    color: #3b82f6;
    stroke-width: 1.5;
    display: block;
}

.goal-title {
    font-size: 16px;
    font-weight: 600;
    color: #243056;
    margin-bottom: 8px;
    margin-top: 0;
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

.stepper-view > .btn {
    align-self: flex-start;
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
    user-select: none;
}

.step-indicator:hover {
    opacity: 0.7;
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

.step-indicator.invalid .step-number {
    border-color: #ef4444;
    background: #ef4444;
    color: white;
}

.step-label {
    font-size: 12px;
    color: #666;
    text-align: center;
    word-break: break-word;
}

.step-title {
    font-size: 11px;
    color: #666;
    text-align: center;
    word-break: break-word;
    margin-top: 4px;
    max-width: 80px;
    white-space: normal;
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

.step-description {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
    line-height: 1.6;
}

.blocks-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.block-wrapper {
    margin-bottom: 0;
}

.button-container {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 16px;
}
</style>
