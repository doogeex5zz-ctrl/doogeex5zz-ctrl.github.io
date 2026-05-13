<script setup>
import { ref, onMounted } from 'vue'

const polls = ref([])
const currentUser = ref(null)

const fetchPolls = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/polls')
    polls.value = await response.json()
  } catch (error) {
    console.error('Помилка завантаження опитувань:', error)
  }
}

onMounted(() => {
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    currentUser.value = JSON.parse(savedUser)
  }
  fetchPolls()
})

const vote = async (pollId, optionIndex) => {
  if (!currentUser.value) {
    alert('Будь ласка, увійдіть в систему, щоб проголосувати!')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollId: pollId,
        optionIndex: optionIndex,
        userEmail: currentUser.value.email
      })
    })

    const data = await response.json()

    if (data.success) {
      fetchPolls() // Миттєво оновлюємо результати після голосування
    } else {
      alert(data.message)
    }
  } catch (error) {
    console.error('Помилка голосування:', error)
  }
}
</script>

<template>
  <main class="container my-5">
    <h2 class="mb-4 text-center">Всі опитування</h2>
    
    <div v-if="polls.length === 0" class="text-center text-muted mt-4">
      <p>Опитувань поки немає. Створіть першим!</p>
    </div>

    <div class="row">
      <div v-for="poll in polls" :key="poll.id" class="col-md-6 mb-4">
        <div class="card shadow-sm poll-card h-100 border-primary">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ poll.question }}</h5>
            <h6 class="card-subtitle mb-3 text-muted">Створив: {{ poll.creatorName }} <br><small>{{ poll.createdAt }}</small></h6>
            
            <div>
              <button 
                v-for="(option, index) in poll.options" 
                :key="index"
                @click="vote(poll.id, index)"
                :disabled="!currentUser || poll.voters.includes(currentUser.email)"
                class="btn btn-outline-primary w-100 mb-2 text-start position-relative">
                {{ option.text }}
                <span class="badge bg-primary position-absolute end-0 me-2 mt-1">{{ option.votes }}</span>
              </button>
            </div>

            <div v-if="currentUser && poll.voters.includes(currentUser.email)" class="alert alert-success mt-3 mb-0 py-2 text-center">
              <small>Ви вже проголосували</small>
            </div>
            <div v-if="!currentUser" class="alert alert-warning mt-3 mb-0 py-2 text-center">
              <small>Увійдіть, щоб голосувати</small>
            </div>

          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.poll-card { transition: transform 0.2s; }
.poll-card:hover { transform: translateY(-5px); }
</style>