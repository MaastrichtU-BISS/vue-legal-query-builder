import type { DefineComponent, Plugin } from "vue";
import type {
  RechtspraakQueryParameters,
  RechtspraakDocument,
  RechtspraakFullTextDocument,
  EchrQueryParameters,
  EchrDocument,
  EchrFullTextDocument,
  BWBItem,
} from "legal-docs-types";

/** Searches legislation by name. Supplied by the host. */
export declare type SearchLaws = (query: string) => Promise<BWBItem[]>;

export declare enum FormType {
  FREE = "free",
  GUIDED = "guided",
}

export declare enum BlockType {
  ARTICLE_FIELD = "ArticleField",
  DATASET_SELECTOR = "DatasetSelector",
  DATE_RANGE = "DateRange",
  DOC_TYPE_SELECTOR = "DocTypeSelector",
  DOMAINS_SELECTOR = "DomainsSelector",
  ECLIS_INPUT = "EclisInput",
  FACTS_INPUT = "FactsInput",
  IMPORTANCE_LEVEL_SELECTOR = "ImportanceLevelSelector",
  INSTANCES_SELECTOR = "InstancesSelector",
  KEYWORDS_INPUT = "KeywordsInput",
  NETWORK_DEGREES = "NetworkDegrees",
  REASONING_INPUT = "ReasoningInput",
  SELECTED_LAWS = "SelectedLaws",
  TEXT_INPUT = "TextInput",
  TEXTAREA_INPUT = "TextAreaInput",
}

export type Dataset = "RS" | "ECHR" | "CJEU";

export interface Block {
  type: BlockType;
  title: string;
  description: string;
  placeholder?: string;
  required?: boolean;
}

export interface Step {
  title: string;
  blocks: Block[];
}

export type GoalFixedParameters = Partial<RechtspraakQueryParameters> & Partial<EchrQueryParameters>;

export interface Goal {
  title: string;
  description: string;
  icon?: string;
  dataset?: Dataset;
  fixedParameters?: GoalFixedParameters;
  steps: Step[];
}

export interface GuidedStructure {
  goals: Goal[];
}

export type LegalDocsQuery =
  | { dataset: "RS"; params: RechtspraakQueryParameters }
  | { dataset: "ECHR"; params: EchrQueryParameters };

export interface LegalDocsFormProps {
  title?: string;
  subtitle?: string;
  type?: FormType;
  guidedStructure?: GuidedStructure;
  onSubmit?: (data: LegalDocsQuery) => Promise<any>;
  /**
   * Searches legislation by name, for the law selector. The form never calls
   * the API itself — point this at your own server.
   */
  onSearchLaws?: SearchLaws;
}

export declare const LegalDocsForm: DefineComponent<LegalDocsFormProps, {}, any>;


export { DocType } from "legal-docs-types";


export declare const VueLegalQueryBuilderPlugin: Plugin;

export default VueLegalQueryBuilderPlugin;
