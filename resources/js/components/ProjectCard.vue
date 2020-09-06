<template>
  <div class="project__card--container">
    <div class="project__card--top-container">
      <router-link :to="{ name: 'project.details', params: { id: data.id} }">
        <img :src="`https://placeimg.com/640/360/tech/${data.id}`" alt="">
      </router-link>
    </div>

    <div class="project__card--body-container">
      <div
        class="project__card--body-salary"
      >
        {{ getRewards(data.salary, data.certificate) }}
      </div>

      <div class="project__card--info-container">
        <h2 class="project__card--name">
          {{ data.name }}
        </h2>
        <div class="project__card--info--consistency">
          <div class="project__card--post-info">
            <div>Expertise in : {{ expertiseIn }}</div>
            <div>Posted by : {{ getFullName }}</div>
            <div>Applicant : {{ data.applicant_type }}</div>
          </div>
          <div>
            <div class="project__card--bounty-info">
              <div class="info-item--container">
                <span class="bounty--span">LVL</span> Superior
              </div>
              <div v-if="data.salary > 0" class="info-item--container">
                <span class="iconify info-item--icon" data-icon="fa-solid:dollar-sign" data-inline="true" width="8" height="15" /> Salary
              </div>
              <div v-if="data.certificate == 1" class="info-item--container">
                <span class="iconify info-item--icon" data-icon="la:certificate-solid" data-inline="true" width="15" height="15" /> Certificate
              </div>
            </div>
            <div class="project__card--extra-info">
              <div>
                &bull; Posted {{ getHumanDate(data.created_at) }}
              </div>
              <div>
                &bull; Max. {{ data.max_person }} Person
              </div>
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
    getFullName () {
      return this.data.user.first_name + ' ' + this.data.user.last_name
    },

    expertiseIn () {
      return this.getExpertise(this.data.ui_ux_designer, this.data.data_expert, this.data.front_end_engineer, this.data.back_end_engineer)
    }
  },

  methods: {
    getExpertise: function (...expertises) {
      if (expertises[0]) expertises[0] = 'UI/UX Designer'
      if (expertises[1]) expertises[1] = 'Frontend Engineer'
      if (expertises[2]) expertises[2] = 'Backend Engineer'
      if (expertises[3]) expertises[3] = 'Data Expert'

      return expertises.filter(expertise => expertise !== 0).join(', ')
    },

    getRewards: function (...rewards) {
      if (rewards[0] !== '0') return new Intl.NumberFormat('id-ID').format(rewards[0]) + ',- IDR'
      else return 'Certificate'
    },

    getHumanDate: function (date) {
      return timeago.format(date)
    }
  }

}
</script>
