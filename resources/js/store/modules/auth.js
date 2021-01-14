import axios from 'axios'
import Cookies from 'js-cookie'
import * as types from '../mutation-types'

// state
export const state = {
  user: null,
  data: null,
  party: null,
  token: Cookies.get('token')
}

// getters
export const getters = {
  user: state => state.user,
  data: state => state.data,
  projects: state => state.data.projects,
  party: state => state.party,
  partyMembers: state => state.party ? state.party.leader.members : null,
  token: state => state.token,
  check: state => state.user !== null
}

// mutations
export const mutations = {
  [types.SAVE_TOKEN] (state, { token, remember }) {
    state.token = token
    Cookies.set('token', token, { expires: remember ? 365 : null })
  },

  [types.FETCH_USER_SUCCESS] (state, { user, projects, wishlists }) {
    state.user = user
    state.data = {
      projects: projects,
      wishlists: wishlists
    }
  },

  [types.FETCH_USER_FAILURE] (state) {
    state.token = null
    Cookies.remove('token')
  },

  [types.FETCH_USER_PARTY] (state, { leader, member }) {
    state.party = {
      leader: leader,
      member: member
    }
  },

  [types.UPDATE_USER_PARTY] (state, { leader }) {
    state.party.leader = leader
  },

  [types.UPDATE_USER] (state, { user }) {
    state.user = user
  },

  [types.UPDATE_USER_AVATAR] (state, { avatar }) {
    state.user.avatar = avatar
  },

  [types.UPDATE_USER_CV] (state, { cv }) {
    state.user.cv = cv
  },

  [types.UPDATE_USER_WISHLISTS] (state, { wishlists }) {
    state.data.wishlists = wishlists
  },

  [types.UPDATE_USER_NOTIFICATIONS] (state, count) {
    state.user.new_notifications_count = count
  },

  [types.LOGOUT] (state) {
    state.user = null
    state.data = null
    state.token = null

    Cookies.remove('token')
  }
}

// actions
export const actions = {
  saveToken ({ commit, dispatch }, payload) {
    commit(types.SAVE_TOKEN, payload)
  },

  async fetchUser ({ commit }) {
    try {
      const { data } = await axios.get('/api/user')

      commit(types.FETCH_USER_SUCCESS, {
        user: data.user,
        projects: data.projects,
        wishlists: data.wishlists
      })
    } catch (e) {
      commit(types.FETCH_USER_FAILURE)
    }
  },

  async fetchUserParty ({ commit }) {
    try {
      const { data } = await axios.get('/api/party')

      commit(types.FETCH_USER_PARTY, data)
    } catch (e) {}
  },

  async updateAvatar ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_AVATAR, payload)
    } catch (e) { }
  },

  async updateCv ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_CV, payload)
    } catch (e) { }
  },

  async updateUser ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER, payload)
    } catch (e) { }
  },

  async updateUserParty ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_PARTY, payload)
    } catch (e) { }
  },

  async updateWishlists ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_WISHLISTS, payload)
    } catch (e) { }
  },

  async updateNotifications ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_NOTIFICATIONS, payload)
    } catch (e) { }
  },

  async logout ({ commit }) {
    try {
      await axios.post('/api/logout')
    } catch (e) { }

    commit(types.LOGOUT)
  }
}
