import axios from 'axios'
import * as types from '../mutation-types'

// state
export const state = {
  shortlist: {
    individuals: [],
    teams: []
  },
  project: {}
}

// getters
export const getters = {
  shortlistIndividuals: state => state.shortlist.individuals,
  shortlistTeams: state => state.shortlist.teams,
  project: state => state.project
}

// mutations
export const mutations = {
  [types.FETCH_SHORTLIST] (state, { shortlistIndividual, shortlistTeam, project }) {
    state.shortlist = {
      individuals: shortlistIndividual.map(e => {
        return {
          id: e.id,
          user_id: e.from_id,
          full_name: e.from.full_name,
          tagname: e.from.tagname,
          avatar: e.from.avatar,
          applicant: 'Individual',
          expertise: e.expertise,
          apply_reason: e.apply_reason,
          self_describe: e.self_describe,
          isAccepted: false
        }
      }),
      teams: shortlistTeam.map(e => {
        return {
          id: e.id,
          applicant: 'Team',
          leader_id: e.from_id,
          apply_reason: e.apply_reason,
          self_describe: e.self_describe,
          isAccepted: false,
          team_members: e.applicant_team_members.map(user => {
            return {
              id: user.id,
              user_id: user.member.id,
              full_name: user.member.full_name,
              tagname: user.member.tagname,
              avatar: user.member.avatar,
              expertise: user.expertise
            }
          })
        }
      })

      // {

      // }
    }

    state.project = project
  }
}

// actions
export const actions = {
  async fetchShortlist ({ commit }, payload) {
    try {
      const { data } = await axios.get('/api/project/' + payload.project_url + '/shortlist')

      commit(types.FETCH_SHORTLIST, data)
    } catch (e) { }
  }
}
