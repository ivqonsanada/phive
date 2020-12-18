import axios from 'axios'
import Cookies from 'js-cookie'
import * as types from '../mutation-types'

// state
export const state = {
  user: null,
  data: null,
  team: null,
  token: Cookies.get('token')
}

// getters
export const getters = {
  user: state => state.user,
  data: state => state.data,
  team: state => state.team,
  token: state => state.token,
  check: state => state.user !== null
}

// mutations
export const mutations = {
  [types.SAVE_TOKEN] (state, { token, remember }) {
    state.token = token
    Cookies.set('token', token, { expires: remember ? 365 : null })
  },

  [types.FETCH_USER_SUCCESS] (state, { user, projects, wishlists, team }) {
    state.user = user
    state.data = {
      projects: projects,
      wishlists: wishlists
    }
    state.team = team
  },

  [types.FETCH_USER_FAILURE] (state) {
    state.token = null
    Cookies.remove('token')
  },

  [types.UPDATE_USER] (state, { user }) {
    state.user = user
  },

  [types.UPDATE_USER_AVATAR] (state, { avatar }) {
    state.user.avatar = avatar
  },

  [types.UPDATE_USER_WISHLISTS] (state, { wishlists }) {
    state.data.wishlists = wishlists
  },

  [types.LOGOUT] (state) {
    state.user = null
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
        wishlists: data.wishlists,
        team: data.team
      })
    } catch (e) {
      commit(types.FETCH_USER_FAILURE)
    }
  },

  async updateAvatar ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_AVATAR, payload)
    } catch (e) { }
  },

  async updateUser ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER, payload)
    } catch (e) { }
  },

  async updateWishlists ({ commit }, payload) {
    try {
      commit(types.UPDATE_USER_WISHLISTS, payload)
    } catch (e) { }
  },

  async logout ({ commit }) {
    try {
      await axios.post('/api/logout')
    } catch (e) { }

    commit(types.LOGOUT)
  }
}
