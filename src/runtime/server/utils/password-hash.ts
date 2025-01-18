import { compare, genSaltSync, hashSync } from 'bcrypt'

export const hashPassword = (password: string) => {
  const salt = genSaltSync(10)
  return hashSync(password, salt)
}

export const comparePassword = (password: string, hashPassword: string) =>
  compare(password, hashPassword).then(resp => resp)
