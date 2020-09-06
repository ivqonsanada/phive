// import axios from 'axios'
import * as types from '../mutation-types'

// state
export const state = {
  title: null
}

// getters
export const getters = {
  title: state => state.title
}

// mutations
export const mutations = {
  [types.NAV_TITLE_CHANGE] (state, { title }) {
    state.title = title
  }
}

// actions
export const actions = {
  async changeTitle ({ commit }, payload) {
    try {
      commit(types.NAV_TITLE_CHANGE, payload)
    } catch (e) { }
  }
}
