export class RegisterDto {
  username: string;
  email: string;
  password: string;
  role?: string; // Optional, default to 'user'
}