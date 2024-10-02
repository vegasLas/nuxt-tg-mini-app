<template>
  <div class="container">
    <div class="form-container">
      <div>
        <h2 class="title">Заполните анкету</h2>
      </div>
      <form class="form" @submit.prevent>
        <div class="input-group">
          <div style="margin-bottom: 1rem;">
            <input
              id="username"
              v-model="name"
              type="text"
              required
              class="input input-top"
              placeholder="имя"
            >
          </div>
          <div style="margin-bottom: 1rem;">
            <input
                id="phone"
                v-model="phone"
                type="tel"
                required
                class="input input-bottom"
                placeholder="Введите ваш номер телефона"
              >
            </div>
            <div style="margin-bottom: 1rem;">
              <textarea
                id="comment"
                v-model="comment"
                class="textarea textarea-bottom"
                placeholder="Комментарий"
              />
            </div>
        </div>
      </form>
      <div class="button-group">
        <MainButton 
          text="Записаться" 
          @click="submitForm"
          :disabled="!isFormValid"
          :progress="isLoading"
        />
        <BackButton @click="goBack" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BackButton, MainButton } from 'vue-tg'
import { useUserInfoStore } from '../stores/useUserInfoStore'
import { storeToRefs } from 'pinia'

const userInfoStore = useUserInfoStore()
const { name, phone, comment, isLoading, isFormValid } = storeToRefs(userInfoStore)

const emit = defineEmits(['back'])

async function submitForm() {
  await userInfoStore.submitForm()
}

function goBack() {
  emit('back')
}
</script>

<style scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.form-container {
  max-width: 28rem;
  width: 100%;
  background-color: #fff;
  padding: 2rem 3rem 1rem 1rem; 
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form {
  margin-top: 2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input {
  appearance: none;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-size: 0.875rem;
  outline: none;
}
.textarea {
  appearance: none;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  color: #1f2937;
  font-size: 0.875rem;
  outline: none;
}
.input-top {
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}

.input-bottom {
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.input:focus {
  border-color: #6366f1;
  ring-color: #6366f1;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-link {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

.back-link:hover {
  color: #4338ca;
}

.submit-button {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: #fff;
  background-color: #4f46e5;
}

.submit-button:hover {
  background-color: #4338ca;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-messages {
  margin-top: 1rem;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
}
</style>