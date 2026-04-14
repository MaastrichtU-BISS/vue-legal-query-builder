import type { QueryParameters } from 'legal-docs-client'

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
  IMPORTANCE_LEVEL_SELECTOR = 'ImportanceLevelSelector',
  INSTANCES_SELECTOR = 'InstancesSelector',
  KEYWORDS_INPUT = 'KeywordsInput',
  NETWORK_DEGREES = 'NetworkDegrees',
  TEXT_INPUT = 'TextInput',
}

export interface Step {
  title: string
  description: string
  required: boolean
  blockType: BlockType
}

export interface Goal {
  title: string
  description: string
  icon?: string
  steps: Step[]
}

export interface GuidedStructure {
  goals: Goal[]
}

export interface LegalDocsFormProps {
  title?: string
  subtitle?: string
  type?: FormType
  guidedStructure?: GuidedStructure
  onSubmit?: (data: QueryParameters) => Promise<any>
}

