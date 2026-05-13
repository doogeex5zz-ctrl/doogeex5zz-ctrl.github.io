<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

// Змінні для форми
const question = ref('')
const options = ref(['', '', '']) // За замовчуванням 3 порожні варіанти

// Перевіряємо, чи користувач увійшов у систему
onMounted(() => {
  const savedUser = localStorage.getItem('currentUser')
  if (!savedUser) {
    alert('Помилка: Ви повинні увійти, щоб створити опитування!')
    router.push('/') // Перекидаємо на вхід
    return
  }
  user.value = JSON.parse(savedUser)
})

const addOption = () => {
  options.value.push('') // Додаємо ще одне поле
}

const submitPoll = async () => {
  // Фільтруємо лише заповнені варіанти відповідей
  const validOptions = options.value.filter(opt => opt.trim() !== '')
  
  if (!question.value.trim() || validOptions.length < 2) {
    alert('Будь ласка, введіть запитання та мінімум два варіанти відповіді!')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creatorName: user.value.name,
        creatorEmail: user.value.email,
        question: question.value,
        options: validOptions
      })
    })

    const data = await response.json()

    if (data.success) {
      alert('Опитування успішно створено!')
      router.push('/profile')
    } else {
      alert(data.message)
    }
  } catch (error) {
    console.error('Помилка:', error)
  }
}
</script>

<template>
  <main class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="mb-4 text-center">Створення нового опитування</h2>
        <div class="card border-primary shadow-sm">
          <div class="card-header bg-primary text-white">
            Конструктор запитання
          </div>
          <div class="card-body">
            <form @submit.prevent="submitPoll">
              <div class="mb-4">
                <label class="form-label fw-bold">Ваше запитання:</label>
                <input v-model="question" type="text" class="form-control form-control-lg" placeholder="Наприклад: Яка ваша улюблена мова програмування?">
              </div>
              
              <label class="form-label fw-bold">Варіанти відповідей:</label>
              <div v-for="(option, index) in options" :key="index" class="mb-2 input-group">
                <span class="input-group-text">{{ index + 1 }}</span>
                <input v-model="options[index]" type="text" class="form-control" :placeholder="'Варіант ' + (index + 1)">
              </div>

              <button type="button" @click="addOption" class="btn btn-outline-secondary btn-sm mb-4">+ Додати ще варіант</button>
              
              <hr>
              <button type="submit" class="btn btn-primary btn-lg w-100">Зберегти та опублікувати опитування</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>