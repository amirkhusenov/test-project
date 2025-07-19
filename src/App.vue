<script setup lang="ts">
import { ref } from 'vue'

const accounts = ref([
  {
    id: 1,
    labels: 'XXX',
    recordType: 'Локальная',
    login: 'Значение',
    showPassword: false
  },
])

const recordTypes = ['Локальная', 'LDAP']
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
                <tr v-for="account in accounts" :key="account.id">
                  <td class="pa-4">
                    <v-text-field
                      :placeholder="account.labels"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                    />
                  </td>
                  
                  <td class="pa-4">
                    <v-select
                      v-model="account.recordType"
                      :items="recordTypes"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                    />
                  </td>
                  
                  <td class="pa-4">
                    <v-text-field
                      :placeholder="account.login"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mt-0"
                    />
                  </td>
                  
                  <td class="pa-4">
                    <div class="d-flex align-center">
                      <v-text-field
                        :type="account.showPassword ? 'password' :  'text'"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mt-0 flex-grow-1"
                        style="max-width: 200px"
                      />
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        class="ml-2"
                        @click="account.showPassword = !account.showPassword"
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