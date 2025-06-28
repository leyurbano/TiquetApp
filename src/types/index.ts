// src/types/index.ts

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Common UI Props
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}

// Navigation types (can be extended as needed)
export interface NavigationProps {
  navigation: any;
  route: any;
}
