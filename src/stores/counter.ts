import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AccountLabel {
  text: string
}

export interface Account {
  id: number
  labels: { text: string }[]
  recordType: 'Локальная' | 'LDAP'
  login: string
  password: string | null
  showPassword: boolean
  errors: {
    labels?: string
    login?: string
    password?: string
  }
  touched: Record<'labels' | 'login' | 'password', boolean>
}

export const useAccountStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])

  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      const parsed = JSON.parse(saved)
      accounts.value = (parsed.accounts || []).map((acc: any) => ({
        ...acc,
        errors: acc.errors || {},
        labels: Array.isArray(acc.labels)
          ? acc.labels.map((l: any) => typeof l === 'string' ? { text: l } : l)
          : (typeof acc.labels === 'string'
              ? acc.labels.split(';').map((label: string) => ({ text: label.trim() })).filter((l: any) => l.text)
              : [])
      }))
    }
  }

  const saveAccounts = () => {
    localStorage.setItem('accounts', JSON.stringify({
      accounts: accounts.value
    }))
  }

  const addAccount = () => {
    const maxId = accounts.value.length > 0 ? Math.max(...accounts.value.map(acc => acc.id)) : 0
    const newAccount: Account = {
      id: maxId + 1,
      labels: [],
      recordType: 'Локальная',
      login: '',
      password: '',
      showPassword: false,
      errors: {},
      touched: { labels: false, login: false, password: false }
    }
    accounts.value.push(newAccount)
    saveAccounts()
  }

  const removeAccount = (id: number) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      saveAccounts()
    }
  }

  const validateAccount = (account: Account): boolean => {
    let isValid = true
    const labelsArray = account.labels
    if (labelsArray.map(l => l.text).join('; ').length > 200) {
      account.errors.labels = 'Максимум 200 символов для всех меток'
      isValid = false
    } else if (labelsArray.length > 10) {
      account.errors.labels = 'Максимум 10 меток'
      isValid = false
    } else {
      for (const label of labelsArray) {
        if (label.text.length > 50) {
          account.errors.labels = 'Каждая метка не более 50 символов'
          isValid = false
          break
        }
      }
    }
    if (!account.login.trim()) {
      account.errors.login = 'Логин обязателен'
      isValid = false
    } else if (account.login.length > 100) {
      account.errors.login = 'Максимум 100 символов'
      isValid = false
    }
    if (account.recordType === 'Локальная') {
      if (!account.password) {
        account.errors.password = 'Пароль обязателен'
        isValid = false
      } else if (account.password.length > 100) {
        account.errors.password = 'Максимум 100 символов'
        isValid = false
      }
    }
    return isValid
  }

  const updateAccount = (id: number, updates: Partial<Account>) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      Object.assign(account, updates)
      if (updates.recordType === 'LDAP') {
        account.password = null
        account.showPassword = false
      }
      validateAccount(account)
      saveAccounts()
    }
  }

  const togglePasswordVisibility = (id: number) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      account.showPassword = !account.showPassword
      saveAccounts()
    }
  }

  loadAccounts()

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
    togglePasswordVisibility,
    validateAccount
  }
})
