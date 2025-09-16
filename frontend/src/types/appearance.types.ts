/**
 * Types for Theme/Appearance Management System
 * Defines interfaces for theme settings and related operations
 */

export interface ThemeSettings {
  logo_url?: string | null;
  banner_url?: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
}

export interface AppearanceFormData {
  logo_url?: string | null;
  banner_url?: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
}

export interface AppearanceResponse {
  data: ThemeSettings;
  message: string;
}

export interface AppearanceFormState {
  data: AppearanceFormData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

export interface AppearanceFormActions {
  updateField: (field: keyof AppearanceFormData, value: string | null) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  resetToDefaults: () => void;
}

export interface UseAppearanceFormReturn extends AppearanceFormState, AppearanceFormActions {}

// Default theme values
export const DEFAULT_THEME: ThemeSettings = {
  logo_url: null,
  banner_url: null,
  color_primary: '#2563eb',
  color_secondary: '#64748b', 
  color_background: '#ffffff',
  color_text: '#1e293b',
};
