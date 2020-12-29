import store from '~/store'

export default async (to, from, next) => {
  if (store.getters['auth/check'] && !store.getters['auth/user'].tagname) {
    next({ name: 'newcomer.page1' })
  } else {
    next()
  }
}
