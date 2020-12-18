// import axios from 'axios'
import * as types from '../mutation-types'
import Axios from 'axios'

// state
export const state = {
  snackbar: null,
  overlay: null,
  inbox: [],
  projectbox: []
}

// getters
export const getters = {
  snackbar: state => state.snackbar,
  overlay: state => state.overlay,
  inbox: state => state.inbox,
  projectbox: state => state.projectbox
}

// mutations
export const mutations = {
  [types.ATTACH_SNACKBAR] (state, { snackbar }) {
    state.snackbar = snackbar
  },

  [types.FETCH_INBOX] (state, data) {
    state.inbox = data
  },

  [types.UPDATE_INBOX] (state, { inbox }) {
    state.inbox = inbox
  },

  [types.FETCH_PROJECTBOX] (state, { project_boxes: projectBoxes }) {
    state.projectbox = projectBoxes
  },

  [types.UPDATE_PROJECTBOX] (state, { projectBoxes }) {
    state.projectbox = projectBoxes
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
      const { data } = await Axios.get('/api/inbox')

      commit(types.FETCH_INBOX, data)
    } catch (e) { }
  },

  async updateInbox ({ commit }, payload) {
    try {
      commit(types.UPDATE_INBOX, payload)
    } catch (e) { }
  },

  async fetchProjectBox ({ commit }) {
    try {
      const { data } = await Axios.get('/api/projectbox')

      commit(types.FETCH_PROJECTBOX, data)
    } catch (e) { }
  },

  async updateProjectBox ({ commit }, payload) {
    try {
      commit(types.UPDATE_PROJECTBOX, payload)
    } catch (e) { }
  }
}
