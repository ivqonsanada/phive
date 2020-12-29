import store from '~/store'

export default async (to, from, next) => {
  if (store.getters['auth/check'] && store.getters['auth/user'].role !== 'Lecturer') {
    next({ name: 'index' })
  } else {
    next()
  }
}
