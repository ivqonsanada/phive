import axios from 'axios'
import store from '~/store'
import router from '~/router'

axios.interceptors.request.use(request => {
  const token = store.getters['auth/token']
  if (token) {
    request.headers.common['Authorization'] = `Bearer ${token}`
  }

  return request
})

axios.interceptors.response.use(response => response, error => {
  const { status } = error.response

  if (status === 401 && store.getters['auth/check']) {
    store.commit('auth/LOGOUT')

    router.push({ name: 'login' })
  }

  if (status === 404) {
    router.push({ path: router.history._startLocation + '/404' })
  }

  return Promise.reject(error)
})
