export const stripPassword = <T extends { password?: string }>(obj: T): Omit<T, 'password'> => {
  const { password, ...rest } = obj;
  return rest;
};
