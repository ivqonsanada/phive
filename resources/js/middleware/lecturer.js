import store from '~/store'

export default async (to, from, next) => {
  if (store.getters['auth/user'].role !== 'lecturer') {
    next({ name: 'index' })
  } else {
    next()
  }
}
