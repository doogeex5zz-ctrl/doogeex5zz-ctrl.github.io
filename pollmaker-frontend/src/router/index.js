import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import AboutView from '../views/AboutView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import CreatePollView from '../views/CreatePollView.vue'
import PollsListView from '../views/PollsListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LoginView },
    { path: '/about', component: AboutView },
    { path: '/register', component: RegisterView },
    { path: '/profile', component: ProfileView },
    { path: '/create', component: CreatePollView },
    { path: '/polls', component: PollsListView }
  ]
})

export default router