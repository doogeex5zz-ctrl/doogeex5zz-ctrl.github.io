<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const myPolls = ref([])

onMounted(async () => {
  // Перевіряємо, чи є збережений користувач
  const savedUser = localStorage.getItem('currentUser')
  if (!savedUser) {
    router.push('/') // Викидаємо на сторінку логіну
    return
  }
  
  user.value = JSON.parse(savedUser)

  // Одразу завантажуємо з сервера опитування, щоб показати власні
  try {
    const response = await fetch('http://localhost:3000/api/polls')
    const allPolls = await response.json()
    // Фільтруємо тільки ті, що створив цей користувач
    myPolls.value = allPolls.filter(p => p.creatorEmail === user.value.email)
  } catch (error) {
    console.error('Помилка завантаження опитувань:', error)
  }
})

const logout = () => {
  localStorage.removeItem('currentUser')
  router.push('/')
}
</script>

<template>
  <main class="container my-5">
    <h2 class="mb-4 text-center">Профіль користувача</h2>
    <div class="row justify-content-center" v-if="user">
      <div class="col-md-8">
        <div class="table-responsive mb-4">
          <table class="table table-bordered table-striped shadow-sm bg-white">
            <thead class="table-dark">
              <tr>
                <th>Поле</th>
                <th>Дані користувача</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Ім'я</strong></td><td>{{ user.name }}</td></tr>
              <tr><td><strong>Email</strong></td><td>{{ user.email }}</td></tr>
              <tr><td><strong>Стать</strong></td><td>{{ user.gender }}</td></tr>
              <tr><td><strong>Дата народження</strong></td><td>{{ user.dob }}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="text-center mb-5">
          <button @click="logout" class="btn btn-danger">Вийти з акаунта</button>
        </div>

        <div class="mt-4">
          <h3>Ваші опитування ({{ myPolls.length }}/5)</h3>
          <div v-if="myPolls.length === 0" class="text-muted">
            Ви ще не створили жодного опитування.
          </div>
          <div v-else>
            <div v-for="poll in myPolls" :key="poll.id" class="alert alert-info">
              {{ poll.question }} <small class="text-muted">({{ poll.createdAt }})</small>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>