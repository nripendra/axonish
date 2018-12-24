export type CommandResponse<TPayload> = {
  success: boolean;
  errors?: Error[];
  payload?: TPayload;
};
