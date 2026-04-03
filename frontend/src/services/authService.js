import { apiPost } from '../api/api';

const REGISTER = '/api/customers/register';
const LOGIN = '/api/customers/login';

export async function registerUser({ name, email, phone, password }) {
  return apiPost(REGISTER, { name, email, phone, password });
}

export async function loginUser({ email, password }) {
  // returns { message, customer } on success (per backend)
  return apiPost(LOGIN, { email, password });
}

// simple localStorage helper
export function saveUserToStorage(customer) {
  localStorage.setItem('eatrova_customer', JSON.stringify(customer));
}
export function getUserFromStorage() {
  const s = localStorage.getItem('eatrova_customer');
  return s ? JSON.parse(s) : null;
}
export function clearUserFromStorage() {
  localStorage.removeItem('eatrova_customer');
}
