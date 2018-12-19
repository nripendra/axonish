export interface CommandResponse<TPayload> {
    success: boolean;
    errors?: Error[];
    payload?: TPayload;
  }
  