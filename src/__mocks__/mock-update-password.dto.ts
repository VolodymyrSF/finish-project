import { UpdatePasswordDto } from "src/modules/managers/dto/update-password.dto";

export const mockUpdatePasswordDto: UpdatePasswordDto = {
  email: 'john@example.com',
  password: 'NewStrongPassword123',
  token: 'valid-reset-token',
};
