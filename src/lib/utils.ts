export const getFistElementSafe = <T>(input: T[]) =>
  input.length ? input[0] : null

export const getStringFromParam = (param: string | string[] | undefined) => {
  return typeof param === "string" ? param : undefined
}
