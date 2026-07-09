import type { RechtspraakQueryParameters, EchrQueryParameters } from 'legal-docs-client'

export enum FormType {
  FREE = 'free',
  GUIDED = 'guided',
}

export enum BlockType {
  ARTICLE_FIELD = 'ArticleField',
  DATASET_SELECTOR = 'DatasetSelector',
  DATE_RANGE = 'DateRange',
  DOC_TYPE_SELECTOR = 'DocTypeSelector',
  DOMAINS_SELECTOR = 'DomainsSelector',
  ECLIS_INPUT = 'EclisInput',
  FACTS_INPUT = 'FactsInput',
  IMPORTANCE_LEVEL_SELECTOR = 'ImportanceLevelSelector',
  INSTANCES_SELECTOR = 'InstancesSelector',
  KEYWORDS_INPUT = 'KeywordsInput',
  NETWORK_DEGREES = 'NetworkDegrees',
  REASONING_INPUT = 'ReasoningInput',
  SELECTED_LAWS = 'SelectedLaws',
  TEXT_INPUT = 'TextInput',
  TEXTAREA_INPUT = 'TextAreaInput',
}

/** Dataset a query targets. CJEU has no backing endpoint in legal-docs-client yet and stays disabled in the UI. */
export type Dataset = 'RS' | 'ECHR' | 'CJEU'

export interface Block {
  type: BlockType
  title: string
  description: string
  placeholder?: string
  required?: boolean
}

export interface Step {
  title: string
  blocks: Block[]
}

/** Shared subset of both query shapes; overlapping field names have compatible types across the two APIs. */
export type GoalFixedParameters = Partial<RechtspraakQueryParameters> & Partial<EchrQueryParameters>

export interface Goal {
  title: string
  description: string
  icon?: string
  fixedParameters?: GoalFixedParameters
  steps: Step[]
}

export interface GuidedStructure {
  goals: Goal[]
}

/** Discriminated union so a host app knows which client method to call with `params`. */
export type LegalDocsQuery =
  | { dataset: 'RS'; params: RechtspraakQueryParameters }
  | { dataset: 'ECHR'; params: EchrQueryParameters }

export interface LegalDocsFormProps {
  title?: string
  subtitle?: string
  type?: FormType
  guidedStructure?: GuidedStructure
  onSubmit?: (data: LegalDocsQuery) => Promise<any>
}
