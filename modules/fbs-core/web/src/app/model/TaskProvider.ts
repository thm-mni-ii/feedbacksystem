export interface TaskProvider {
  id: string;
  displayName: string;
  description?: string;
  icon: string;
  version: string;
  evaluationEndpointUrl: string;
  healthEndpointUrl: string;
  configUiUrl?: string;
  solveUiUrl?: string;
  resultUiUrl?: string;
  supportedMediaTypes: string[];
  hasSubtasks: boolean;
  supportsStagedFeedback: boolean;
  configSchema?: any;
  isActive?: boolean;
  active?: boolean;
}

export interface CreateTaskProviderRequest {
  id: string;
  displayName: string;
  description?: string;
  icon: string;
  version: string;
  evaluationEndpointUrl: string;
  healthEndpointUrl: string;
  configUiUrl?: string;
  solveUiUrl?: string;
  resultUiUrl?: string;
  supportedMediaTypes?: string[];
  hasSubtasks?: boolean;
  supportsStagedFeedback?: boolean;
  configSchema?: any;
  isActive?: boolean;
}

export interface UpdateTaskProviderRequest {
  displayName?: string;
  description?: string;
  icon?: string;
  version?: string;
  evaluationEndpointUrl?: string;
  healthEndpointUrl?: string;
  configUiUrl?: string;
  solveUiUrl?: string;
  resultUiUrl?: string;
  supportedMediaTypes?: string[];
  hasSubtasks?: boolean;
  supportsStagedFeedback?: boolean;
  configSchema?: any;
  isActive?: boolean;
}
