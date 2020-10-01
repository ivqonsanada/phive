// import axios from 'axios'
import * as types from '../mutation-types'
import Axios from 'axios'

// state
export const state = {
  snackbar: null,
  overlay: null,
  inbox: null
}

// getters
export const getters = {
  snackbar: state => state.snackbar,
  overlay: state => state.overlay,
  inbox: state => state.inbox
}

// mutations
export const mutations = {
  [types.ATTACH_SNACKBAR] (state, { snackbar }) {
    state.snackbar = snackbar
  },

  [types.FETCH_INBOX] (state, data) {
    state.inbox = data
  }
}

// actions
export const actions = {
  async attachSnackbar ({ commit }, payload) {
    try {
      commit(types.ATTACH_SNACKBAR, payload)
    } catch (e) { }
  },

  async fetchInbox ({ commit }) {
    try {
      const { data } = await Axios.post('/api/inbox')

      commit(types.FETCH_INBOX, data)
    } catch (e) { }
  }
}
