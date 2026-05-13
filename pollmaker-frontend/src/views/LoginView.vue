<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // Відправляємо дані на наш сервер (порт 3000) [cite: 198]
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await response.json()

    if (data.success) {
      // Зберігаємо дані користувача в localStorage лише для того, 
      // щоб сайт "пам'ятав" нас після перезавантаження сторінки
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      alert('Вхід успішний!')
      router.push('/profile') // Переходимо в профіль
    } else {
      alert(data.message)
    }
  } catch (error) {
    console.error('Помилка входу:', error)
  }
}
</script>

<template>
  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Вхід до сайту</h3>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" placeholder="name@example.com" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Пароль</label>
                <input v-model="password" type="password" class="form-control" required>
              </div>
              <button type="submit" class="btn btn-primary w-100">Увійти</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>