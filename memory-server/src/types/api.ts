export interface ApiStatus {
  status: string
  projectPath: string
  language: string
  theme: string
  assets: {
    total: number
    constitution: number
    memory: number
    knowledge: number
  }
  sseClients: number
}
