import Cookies from 'js-cookie'

const TokenKey = 'X-Token'
const UserKey = 'X-Uid'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}

export function getUser() {
  return Cookies.get(UserKey)
}

export function setUser(uid) {
  return Cookies.set(UserKey, uid)
}

export function removeUser() {
  return Cookies.remove(UserKey)
}

export function getCookieToken() {
  return Cookies.get(TokenKey)
}

export function setCookieToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeCookieToken() {
  return Cookies.remove(TokenKey)
}
