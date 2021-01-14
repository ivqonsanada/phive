// import axios from 'axios'
import * as types from '../mutation-types'

// state
export const state = {
  title: null,
  overlay: false
}

// getters
export const getters = {
  title: state => state.title,
  overlay: state => state.overlay
}

// mutations
export const mutations = {
  [types.NAV_TITLE_CHANGE] (state, { title }) {
    state.title = title
  },

  [types.NAV_TOGGLE_OVERLAY] (state) {
    state.overlay = !state.overlay
  }
}

// actions
export const actions = {
  async changeTitle ({ commit }, payload) {
    try {
      commit(types.NAV_TITLE_CHANGE, payload)
    } catch (e) { }
  },

  async toggleOverlay ({ commit }) {
    try {
      commit(types.NAV_TOGGLE_OVERLAY)
    } catch (e) { }
  }
}
