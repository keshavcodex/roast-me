export interface RoastRequest {
  message: string;
  intensity: number;
}

export interface RoastResponse {
  roast: string;
  intensity: number;
}

export class RoastApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "configuration" | "network" | "timeout" | "server" | "response",
  ) {
    super(message);
    this.name = "RoastApiError";
  }
}
