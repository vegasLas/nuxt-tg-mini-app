<template>
  <div class="user-info-form">
    <h2>User Information</h2>
    <div class="form-group">
      <label for="username">Username:</label>
      <input id="username" v-model="username" type="text" placeholder="Enter your username">
    </div>
    <div class="form-group">
      <label for="phone">Phone:</label>
      <input id="phone" v-model="phone" type="tel" placeholder="Enter your phone number">
    </div>
    <div class="button-group">
      <MainButton text="записаться" @click="submitForm" :disabled="!isFormValid"/>
      <BackButton @click="goBack" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BackButton, MainButton } from 'vue-tg'


const username = ref('')
const phone = ref('')

const isFormValid = computed(() => {
  return username.value.trim() !== '' && phone.value.trim() !== ''
})

const emit = defineEmits(['submit', 'back'])

function submitForm() {
  if (isFormValid.value) {
    emit('submit', { username: username.value, phone: phone.value })
  }
}

function goBack() {
  	emit('back')
}
</script>

<style scoped>
.user-info-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn, .back-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.back-btn {
  background-color: #f44336;
  color: white;
}

.back-btn:hover {
  background-color: #d32f2f;
}
</style>