import axios from 'axios'
import * as types from '../mutation-types'

// state
export const state = {
  user: {
    user: {
      avatar: null
    }
  },
  project: {
    applicant_type: null,
    user: {
      tagname: 0
    }
  }
}

// getters
export const getters = {
  user: state => state.user,
  project: state => state.project

}

// mutations
export const mutations = {
  [types.FETCH_VISITED_USER] (state, { user }) {
    state.user = user
  },
  [types.FETCH_VISITED_PROJECT] (state, { project }) {
    state.project = project
  }
}

// actions
export const actions = {
  async fetchVisitedUser ({ commit }, payload) {
    try {
      const { data } = await axios.get('/api/user/' + payload.tagname)

      commit(types.FETCH_VISITED_USER, { user: data })
    } catch (e) { }
  },

  async fetchVisitedProject ({ commit }, payload) {
    try {
      const { data } = await axios.get('/api/project/' + payload.id)

      commit(types.FETCH_VISITED_PROJECT, { project: data })
    } catch (e) {

    }
  }
}
