export class ManagerAuthResDto {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isBanned: boolean;
  created_at: Date | null;
  updated_at: Date | null;
}
