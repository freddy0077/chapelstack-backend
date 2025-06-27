export interface JwtPayload {
  sub: string; // Typically the user ID
  email: string;
  // Add any other fields included in the JWT payload
}
