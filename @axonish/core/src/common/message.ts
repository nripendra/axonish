export class Message<TPayload, TResponse> {
  constructor(public type: string, public payload: TPayload) {}
}
