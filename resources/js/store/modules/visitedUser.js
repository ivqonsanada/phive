import axios from 'axios'
import * as types from '../mutation-types'

// state
export const state = {
  data: null
}

// getters
export const getters = {
  data: state => state.data
}

// mutations
export const mutations = {
  [types.FETCH_VISITED_USER] (state, { data }) {
    state.data = data
  }
}

// actions
export const actions = {
  async fetchVisitedUser ({ commit }, payload) {
    try {
      const { data } = await axios.get('/api/user/' + payload.tagname)

      commit(types.FETCH_VISITED_USER, { data: data })
    } catch (e) { }
  }
}
