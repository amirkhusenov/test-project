<script setup lang="ts">
import { useAccountStore } from './stores/counter'

const accountStore = useAccountStore()

const recordTypes = ['Локальная', 'LDAP']

// Обработчики событий
const handleAddAccount = () => {
  accountStore.addAccount()
}

const handleRemoveAccount = (id: number) => {
  accountStore.removeAccount(id)
}

const handleUpdateAccount = (id: number, field: string, value: any) => {
  accountStore.updateAccount(id, { [field]: value })
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
                    <span class="text-subtitle-2 font-weight-medium">Пароль</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="account in accountStore.accounts" :key="account.id">
                  <!-- Метки -->
                  <td class="pa-4">
                    <v-text-field
                      :model-value="account.labels"
                      @update:model-value="(value) => handleUpdateAccount(account.id, 'labels', value)"
                      @blur="handleBlur(account.id)"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                      :error="!!account.errors.labels"
                      :error-messages="account.errors.labels"
                      placeholder="Введите метки через ;"
                      maxlength="50"
                    />
                  </td>
                  
                  <!-- Тип записи -->
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
                  
                  <!-- Логин -->
                  <td class="pa-4">
                    <v-text-field
                      :model-value="account.login"
                      @update:model-value="(value) => handleUpdateAccount(account.id, 'login', value)"
                      @blur="handleBlur(account.id)"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                      :error="!!account.errors.login"
                      :error-messages="account.errors.login"
                      placeholder="Введите логин"
                      maxlength="100"
                      required
                    />
                  </td>
                  
                  <!-- Пароль -->
                  <td class="pa-4">
                    <div v-if="account.recordType === 'Локальная'" class="d-flex align-center">
                      <v-text-field
                        :model-value="account.password"
                        @update:model-value="(value) => handleUpdateAccount(account.id, 'password', value)"
                        @blur="handleBlur(account.id)"
                        :type="account.showPassword ? 'text' : 'password'"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        style="max-width: 200px"
                        :error="!!account.errors.password"
                        :error-messages="account.errors.password"
                        placeholder="Введите пароль"
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
                          {{ account.showPassword ? 'mdi-eye-off' : 'mdi-eye' }}
                        </v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        class="ml-1"
                        @click="handleRemoveAccount(account.id)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                    <div v-else class="d-flex align-center">
                      <v-text-field
                        value=""
                        disabled
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        style="max-width: 200px"
                        placeholder="Пароль скрыт для LDAP"
                      />
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        color="error"
                        class="ml-1"
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