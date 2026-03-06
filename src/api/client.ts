import { LegalDocument, LegalDocumentNetwork, LegalDocumentQuery, LegalDocsClientConfig, FullTextDocument } from "../types";
import axios, { AxiosInstance } from "axios";

export class LegalDocsClient {
  private client: AxiosInstance;
  private config: LegalDocsClientConfig;

  constructor(config: LegalDocsClientConfig) {
    this.config = {
      baseURL: "https://api.caselawexplorer.tech/api",
      timeout: 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...this.config.headers,
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        // You can add custom logic here (e.g., logging, authentication)
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        const errorMessage =
          error.response?.data?.message || error.message || "An error occurred";
        return Promise.reject(new Error(errorMessage));
      },
    );
  }

  /**
   * Fetch legal documents based on query parameters
   */
  async fetchDocuments(query: LegalDocumentQuery): Promise<LegalDocument[]> {
    try {
      const response = await this.client.post<LegalDocumentNetwork>(
        "/network",
        {
          arguments: { ...query.query },
        },
      );
      return response.data.nodes;
    } catch (error: any) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

    /**
   * Fetch Full Text documents based on query parameters
   */
  async getFullText(eclis: string[]): Promise<FullTextDocument[]> {
    try {
      const response = await this.client.post<FullTextDocument[]>(
        "/network/text",
        {
          ecli: eclis,
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

  /**
   * Update the API key
   */
  setApiKey(apiKey: string): void {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${apiKey}`;
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers.common, headers);
  }
}

/**
 * Factory function to create a new client instance
 */
export function createLegalDocsClient(
  config: LegalDocsClientConfig,
): LegalDocsClient {
  return new LegalDocsClient(config);
}
