import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

export interface LegalDocumentQuery {
  documentType?: string
  clientName?: string
  jurisdiction?: string
  dateRange?: string
  referenceNumber?: string
  [key: string]: any
}

export interface LegalDocument {
  id: string
  type: string
  title: string
  date: string
  url?: string
  metadata?: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface LegalDocsClientConfig {
  baseURL: string
  apiKey?: string
  timeout?: number
  headers?: Record<string, string>
}

export class LegalDocsClient {
  private client: AxiosInstance
  private config: LegalDocsClientConfig

  constructor(config: LegalDocsClientConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    })

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // You can add custom logic here (e.g., logging, authentication)
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        // Handle errors globally
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
        return Promise.reject(new Error(errorMessage))
      }
    )
  }

  /**
   * Fetch legal documents based on query parameters
   */
  async fetchDocuments(query: LegalDocumentQuery): Promise<LegalDocument[]> {
    try {
      const response = await this.client.get<ApiResponse<LegalDocument[]>>('/documents', {
        params: query
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(`Failed to fetch documents: ${error.message}`)
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(id: string): Promise<LegalDocument> {
    try {
      const response = await this.client.get<ApiResponse<LegalDocument>>(`/documents/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(`Failed to get document: ${error.message}`)
    }
  }

  /**
   * Search documents with filters
   */
  async searchDocuments(searchTerm: string, filters?: LegalDocumentQuery): Promise<LegalDocument[]> {
    try {
      const response = await this.client.post<ApiResponse<LegalDocument[]>>('/documents/search', {
        search: searchTerm,
        filters
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(`Failed to search documents: ${error.message}`)
    }
  }

  /**
   * Download a document
   */
  async downloadDocument(id: string): Promise<Blob> {
    try {
      const response = await this.client.get(`/documents/${id}/download`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to download document: ${error.message}`)
    }
  }

  /**
   * Make a custom request
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config)
      return response.data.data
    } catch (error: any) {
      throw new Error(`Request failed: ${error.message}`)
    }
  }

  /**
   * Update the API key
   */
  setApiKey(apiKey: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers.common, headers)
  }
}

/**
 * Factory function to create a new client instance
 */
export function createLegalDocsClient(config: LegalDocsClientConfig): LegalDocsClient {
  return new LegalDocsClient(config)
}
