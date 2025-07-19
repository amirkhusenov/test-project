<script setup lang="ts">
import { useAccountStore } from './stores/counter'
import { ref, watch } from 'vue'

const accountStore = useAccountStore()

const recordTypes = ['Локальная', 'LDAP']

const labelInputs = ref<Record<number, string>>({})

watch(
  () => accountStore.accounts.map(acc => acc.id),
  (ids: number[]) => {
    ids.forEach((id: number) => {
      const acc: any = accountStore.accounts.find((a: any) => a.id === id)
      if (acc && !(id in labelInputs.value)) {
        labelInputs.value[id] = Array.isArray(acc.labels)
          ? acc.labels.map((l: any) => l.text).join('; ')
          : acc.labels
      }
    })
  },
  { immediate: true }
)

const handleLabelsBlur = (id: number) => {
  const value = labelInputs.value[id] || ''
  const arr = value
    .split(';')
    .map((label: string) => label.trim())
    .filter((label: string) => label.length > 0)
    .map((label: string) => ({ text: label }))
  accountStore.updateAccount(id, { labels: arr })
}

const handleAddAccount = () => {
  accountStore.addAccount()
}

const handleRemoveAccount = (id: number) => {
  accountStore.removeAccount(id)
}

const handleUpdateAccount = (id: number, field: string, value: any) => {
  if (field === 'labels') {
    labelInputs.value[id] = value
  } else {
    accountStore.updateAccount(id, { [field]: value })
  }
}

const handleTogglePassword = (id: number) => {
  accountStore.togglePasswordVisibility(id)
}

const handleBlur = (id: number) => {
  const account = accountStore.accounts.find(acc => acc.id === id)
  if (account) {
    accountStore.validateAccount(account)
  }
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="text-h4 font-weight-bold">Учетные записи</h1>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            variant="elevated"
            size="large"
            @click="handleAddAccount"
          >
            Добавить
          </v-btn>
        </div>

        <v-alert
          type="info"
          variant="tonal"
          class="mb-6"
          prepend-icon="mdi-information"
        >
          Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
        </v-alert>

        <v-card>
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th class="text-left pa-4" style="width: 25%">
                    <span class="text-subtitle-2 font-weight-medium">Метки</span>
                  </th>
                  <th class="text-left pa-4" style="width: 20%">
                    <span class="text-subtitle-2 font-weight-medium">Тип записи</span>
                  </th>
                  <th class="text-left pa-4" style="width: 25%">
                    <span class="text-subtitle-2 font-weight-medium">Логин</span>
                  </th>
                  <th class="text-left pa-4" style="width: 30%">
                    <span class="text-subtitle-2 font-weight-medium">Пароль / Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in accountStore.accounts" :key="account.id">
                  <td class="pa-4">
                    <v-text-field
                      :model-value="labelInputs[account.id]"
                      @update:model-value="(value) => handleUpdateAccount(account.id, 'labels', value)"
                      @blur="() => handleLabelsBlur(account.id)"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                      :error="!!account.errors?.labels"
                      :error-messages="account.errors?.labels"
                      placeholder="Значение"
                    />
                  </td>
                  <td class="pa-4">
                    <v-select
                      :model-value="account.recordType"
                      @update:model-value="(value) => handleUpdateAccount(account.id, 'recordType', value)"
                      @blur="handleBlur(account.id)"
                      :items="recordTypes"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                    />
                  </td>
                  <td
                    class="pa-4"
                    :colspan="account.recordType === 'LDAP' ? 2 : 1"
                    :style="{ width: account.recordType === 'LDAP' ? '55%' : '25%' }"
                  >
                    <div class="d-flex align-center">
                      <v-text-field
                        :model-value="account.login"
                        @update:model-value="(value) => handleUpdateAccount(account.id, 'login', value)"
                        @blur="handleBlur(account.id)"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        :error="!!account.errors.login"
                        :error-messages="account.errors.login"
                        placeholder="Логин"
                        maxlength="100"
                        required
                      />
                      <v-btn
                        v-if="account.recordType === 'LDAP'"
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        class="ml-2"
                        @click="handleRemoveAccount(account.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <div v-if="account.recordType === 'LDAP'" style="width: 50px;"></div>
                    </div>
                  </td>
                  <td
                    v-if="account.recordType === 'Локальная'"
                    class="pa-4"
                    :style="{ width: '30%' }"
                  >
                    <div class="d-flex align-center">
                      <v-text-field
                        :model-value="account.password"
                        @update:model-value="(value) => handleUpdateAccount(account.id, 'password', value)"
                        @blur="handleBlur(account.id)"
                        :type="account.showPassword ? 'text' : 'password'"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        :error="!!account.errors.password"
                        :error-messages="account.errors.password"
                        placeholder="Пароль"
                        maxlength="100"
                        required
                      />
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        class="ml-2"
                        @click="handleTogglePassword(account.id)"
                      >
                        <v-icon>
                          {{ account.showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        class="ml-2"
                        @click="handleRemoveAccount(account.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-table {
  border-collapse: separate;
  border-spacing: 0;
}

.v-table th {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-table td {
  border-bottom: 1px solid #f0f0f0;
}

.v-table tr:hover {
  background-color: #fafafa;
}
</style>