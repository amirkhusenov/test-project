import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AccountLabel {
  text: string
}

export interface Account {
  id: number
  labels: string
  recordType: 'Локальная' | 'LDAP'
  login: string
  password: string
  showPassword: boolean
  errors: {
    labels?: string
    login?: string
    password?: string
  }
}

export const useAccountStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const nextId = ref(1)

  const recalculateNextId = () => {
    if (accounts.value.length === 0) {
      nextId.value = 1
    } else {
      const maxId = Math.max(...accounts.value.map(account => account.id))
      nextId.value = maxId + 1
    }
  }

  const loadAccounts = () => {
    const saved = localStorage.getItem('accounts')
    if (saved) {
      const parsed = JSON.parse(saved)
      accounts.value = parsed.accounts || []
      recalculateNextId()
    }
  }

  const saveAccounts = () => {
    localStorage.setItem('accounts', JSON.stringify({
      accounts: accounts.value,
      nextId: nextId.value
    }))
  }

  const addAccount = () => {
    const newAccount: Account = {
      id: nextId.value++,
      labels: '',
      recordType: 'Локальная',
      login: '',
      password: '',
      showPassword: false,
      errors: {}
    }
    accounts.value.push(newAccount)
    saveAccounts()
  }

  const removeAccount = (id: number) => {
    const index = accounts.value.findIndex(account => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
      recalculateNextId()
      saveAccounts()
    }
  }

  const validateAccount = (account: Account): boolean => {
    const errors: Account['errors'] = {}
    let isValid = true

    if (account.labels.length > 50) {
      errors.labels = 'Максимум 50 символов'
      isValid = false
    }

    if (!account.login.trim()) {
      errors.login = 'Логин обязателен'
      isValid = false
    } else if (account.login.length > 100) {
      errors.login = 'Максимум 100 символов'
      isValid = false
    }

    if (account.recordType === 'Локальная') {
      if (!account.password.trim()) {
        errors.password = 'Пароль обязателен для локальных записей'
        isValid = false
      } else if (account.password.length > 100) {
        errors.password = 'Максимум 100 символов'
        isValid = false
      }
    }

    account.errors = errors
    return isValid
  }

  const updateAccount = (id: number, updates: Partial<Account>) => {
    const account = accounts.value.find(acc => acc.id === id)
    if (account) {
      Object.assign(account, updates)
      
      if (updates.recordType === 'LDAP') {
        account.password = ''
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

  const parseLabels = (labelsString: string): AccountLabel[] => {
    if (!labelsString.trim()) return []
    
    return labelsString
      .split(';')
      .map(label => label.trim())
      .filter(label => label.length > 0)
      .map(label => ({ text: label }))
  }

  const getAccountLabels = (accountId: number): AccountLabel[] => {
    const account = accounts.value.find(acc => acc.id === accountId)
    return account ? parseLabels(account.labels) : []
  }

  const getAllLabels = computed(() => {
    const allLabels: AccountLabel[] = []
    accounts.value.forEach(account => {
      allLabels.push(...parseLabels(account.labels))
    })
    return allLabels
  })

  const getUniqueLabels = computed(() => {
    const labels = getAllLabels.value
    const uniqueLabels = new Set(labels.map(label => label.text))
    return Array.from(uniqueLabels).map(text => ({ text }))
  })

  loadAccounts()

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
    togglePasswordVisibility,
    validateAccount,
    parseLabels,
    getAccountLabels,
    getAllLabels,
    getUniqueLabels
  }
})
