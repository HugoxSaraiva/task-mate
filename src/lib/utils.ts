export const getFistElementSafe = <T>(input: T[]) =>
  input.length ? input[0] : null

export const getStringFromParam = (param: string | string[] | undefined) => {
  return typeof param === "string" ? param : undefined
}

export const getStringFromParamArray = (
  param: string | string[] | undefined
) => {
  return Array.isArray(param) && param.length > 0 ? param[0] : undefined
}
