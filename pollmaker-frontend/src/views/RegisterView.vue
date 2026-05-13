<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Створюємо реактивні змінні для полів форми
const name = ref('')
const email = ref('')
const gender = ref('')
const dob = ref('')
const password = ref('')

const handleRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        gender: gender.value,
        dob: dob.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (data.success) {
      // Зберігаємо сесію і перекидаємо в профіль
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      alert('Реєстрація успішна!')
      router.push('/profile')
    } else {
      alert(data.message)
    }
  } catch (error) {
    console.error('Помилка реєстрації:', error)
  }
}
</script>

<template>
  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Реєстрація користувача</h3>
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label class="form-label">Ім'я</label>
                <input v-model="name" type="text" class="form-control" placeholder="Іван Іванов" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" placeholder="name@example.com" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Стать</label>
                <select v-model="gender" class="form-select" required>
                  <option value="" disabled>Оберіть стать...</option>
                  <option value="Чоловіча">Чоловіча</option>
                  <option value="Жіноча">Жіноча</option>
                  <option value="Інше">Інше</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="form-label">Дата народження</label>
                <input v-model="dob" type="date" class="form-control" required>
              </div>
              <div class="mb-4">
                <label class="form-label">Пароль</label>
                <input v-model="password" type="password" class="form-control" placeholder="Введіть пароль" required>
              </div>
              <button type="submit" class="btn btn-success w-100">Зареєструватися</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>