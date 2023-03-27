export const getFistElementSafe = <T>(input: T[]) =>
  input.length ? input[0] : null
