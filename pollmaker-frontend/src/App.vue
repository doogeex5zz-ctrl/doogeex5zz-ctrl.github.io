<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="bg-primary shadow-sm">
      <div class="container">
          <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
              <RouterLink class="navbar-brand fw-bold" to="/">📊 PollMaker</RouterLink>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav ms-auto nav-pills">
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/">Вхід</RouterLink></li>
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/register">Реєстрація</RouterLink></li>
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/profile">Профіль</RouterLink></li>
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/create">Створити опитування</RouterLink></li>
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/polls">Переглянути опитування</RouterLink></li>
                      <li class="nav-item"><RouterLink class="nav-link text-white" to="/about">Про додаток</RouterLink></li>
                  </ul>
              </div>
          </nav>
      </div>
  </header>

  <RouterView />

  <footer class="bg-dark text-light py-3 mt-auto">
      <div class="container text-center">
          <p class="mb-0">&copy; 2026 PollMaker. Всі права захищено.</p>
      </div>
  </footer>
</template>

<style>
/* Загальні стилі з твого проєкту */
body { 
  display: flex; 
  flex-direction: column; 
  min-height: 100vh; 
  margin: 0;
}
#app { 
  display: flex; 
  flex-direction: column; 
  min-height: 100vh; 
  width: 100%;
}
main { 
  flex: 1; 
}
</style>