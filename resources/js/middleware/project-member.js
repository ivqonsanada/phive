import store from '~/store'

export default async (to, from, next) => {
  let isMember = true

  console.log(store.getters['visit/project'])
  // if (store.getters['visit/project'].project_team) {
  //   isMember = store.getters['visit/project'].project_team.members.filter(member => member.member_id === store.getters['auth/user'].id).length === 1
  // }

  if (store.getters['visit/project'] && !isMember) {
    next({ name: 'index' })
  } else {
    next()
  }
}
