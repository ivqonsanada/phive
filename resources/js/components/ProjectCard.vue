<template>
  <div class="project__card--container">
    <div class="project__card--top-container">
      <router-link :to="{ name: 'project.details', params: { id: project.id } }">
        <img :src="`https://placeimg.com/640/360/tech/${project.id}`" loading="lazy">
      </router-link>
    </div>

    <div class="project__card--body-container">
      <div class="project__card--body-salary">
        {{ rewards }}
      </div>

      <div class="project__card--info-container">
        <h2 class="project__card--name">
          {{ project.title }}
        </h2>
        <div class="project__card--info--consistency">
          <div class="project__card--post-info">
            <div class="ellipsies">
              Expertise in : {{ expertiseIn }}
            </div>
            <div class="ellipsies">
              Posted by : {{ fullName }}
            </div>
            <div class="ellipsies">
              Applicant : {{ project.applicant_type }}
            </div>
          </div>
          <div>
            <div class="project__card--bounty-info">
              <div class="info-item--container">
                <span class="bounty--span">LVL</span>
                <span>{{ project.level_applicant }}</span>
              </div>
              <div v-if="project.salary > 0" class="info-item--container">
                <span>
                  <span
                    class="iconify info-item--icon"
                    data-icon="fa-solid:dollar-sign"
                    data-inline="true"
                    width="8"
                    height="15"
                  />
                </span>
                <span>Salary</span>
              </div>
              <div v-if="project.certificate === 1" class="info-item--container">
                <span>
                  <span
                    class="iconify info-item--icon"
                    data-icon="la:certificate-solid"
                    data-inline="true"
                    width="15"
                    height="15"
                  />
                </span>
                <span>Certificate</span>
              </div>
            </div>
            <div class="project__card--extra-info">
              <div>&bull; Posted {{ getHumanDate(project.created_at) }}</div>
              <div>&bull; Max. {{ project.max_person }} Person</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as timeago from 'timeago.js'

export default {
  name: 'ProjectCard',

  props: {
    data: { type: Object, default: null }
  },

  computed: {
    fullName () {
      return this.project.user.first_name + ' ' + this.project.user.last_name
    },

    expertiseIn () {
      let expertises = [
        {
          name: 'UI/UX Designer',
          isRequired: this.project.ui_ux_designer
        },
        {
          name: 'Frontend Engineer',
          isRequired: this.project.front_end_engineer
        },
        {
          name: 'Backend Engineer',
          isRequired: this.project.back_end_engineer
        },
        {
          name: 'Data Expert',
          isRequired: this.project.data_expert
        }
      ].filter(expertise => expertise.isRequired == 1)
        .map(expertise => expertise.name)
        .join(', ')

      return expertises
    },

    rewards () {
      return this.getRewards(this.project.salary, this.project.certificate)
    },

    project () {
      if (this.data.project) return this.data.project

      return this.data
    }
  },

  methods: {

    getRewards: function (...rewards) {
      if (rewards[0] !== '0') {
        return new Intl.NumberFormat('id-ID').format(rewards[0]) + ',- IDR'
      } else return 'Certificate'
    },

    getHumanDate: function (date) {
      return timeago.format(date)
    }
  }
}
</script>
