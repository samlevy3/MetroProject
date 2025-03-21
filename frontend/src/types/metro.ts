export interface MetroLine {
  id: string;
  name: string;
  status: string;
  nextArrival: string;
}

export interface ApiResponse {
  data: MetroLine[];
  error?: string;
} 