export interface ApiResponseWrapper<T> {
  message: string;
  data: T;
  success: boolean;
  fieldErrors: any;
}
