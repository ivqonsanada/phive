<template>
  <div class="project-details--container">
    <div class="details--top-container">
      <div>
        <div v-if="project.state == 'load'">
          <content-placeholders :rounded="true">
            <content-placeholders-img />
            <content-placeholders-heading />
          </content-placeholders>
        </div>
        <div v-if="project.state != 'load'" class="project-details--image-container">
          <div id="project-details--image" :style="cssProps" />
        </div>
        <h1 class="project-details--h1">
          {{ project.name }}
        </h1>
      </div>
      <div class="project-details--action-button">
        <router-link :to="{ name: 'project.apply.individual', params: { name: project.name } }">
          <button class="project__apply-button">
            Apply Project
          </button>
        </router-link>
        <button class="project__wishlist-button">
          <span class="iconify" data-icon="ic:round-add-circle-outline" data-inline="true" width="24" height="24" />
          Wishlist
        </button>
      </div>
      <h2 id="project-details" v-scroll-to="'#project-details'" class="project-details--h2">
        <a href="#project-details" class="button__project--more">
          <span class="iconify" data-icon="zmdi:more" data-inline="false" />
          Project Details
        </a>
      </h2>
    </div>
    <div class="project-details--main-body">
      <div class="project-details__lecturer-info">
        <div class="lecturer-info--left">
          <router-link :to="{ path: '/@/' + project.user.tagname }" class="lencturer-text-link">
            <div class="lecturer-info--image-container">
              <img :src="project.user.avatar" :alt="`${getFullName} Photo Profile`">
            </div>

            <div>
              <div><strong>Posted By</strong></div>
              <div>{{ getFullName }}</div>
              <div>{{ project.user.identity_number }}</div>
              <div>{{ project.user.expertise }}</div>
            </div>
          </router-link>
        </div>
        <div class="lecturer-info--right">
          <span class="iconify" data-icon="dashicons:share" data-inline="true" width="30" height="30" />
        </div>
      </div>

      <div class="project-description">
        <h3>Description</h3>
        <p>{{ project.description }}</p>
      </div>
      <div class="project-requirements">
        <h3>Requirements</h3>
        <ul class="requirements--container">
          <li v-for="req in project.requirements" :key="req.id">
            {{ req.requirement }}
          </li>
        </ul>
      </div>
      <div class="project-skills">
        <h3>Skills</h3>
        <div class="skills--container">
          <BubbleSkill v-for="skill in project.skills" :key="skill.id" :color="bgBubble" :name="skill.skill" />
        </div>
      </div>
      <div class="project-summary">
        <h2 class="summary--h2">
          Summary Project
        </h2>
        <div class="summary--items">
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="bi:brush" data-inline="true" width="15" height="15" />
            </div> Expertise in {{ expertiseIn }}
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="fa-solid:dollar-sign" data-inline="true" width="15" height="15" />
            </div> Salary {{ new Intl.NumberFormat('id-ID').format(project.salary) }},- IDR / Person {{ project.certificate === '1' ? '& Certificate' : '' }}
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="ic:round-access-time" data-inline="true" width="15" height="15" />
            </div> Posted {{ getHumanDate(project.created_at) }}.
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="ic:baseline-work" data-inline="true" width="15" height="15" />
            </div> 10 Total Applicants
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="ant-design:star-filled" data-inline="true" width="15" height="15" />
            </div> Joining Project Grant 1000 Points
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="iconify" data-icon="ic:round-supervisor-account" data-inline="true" width="15" height="15" />
            </div> Max. {{ project.max_person }} Person ({{ project.applicant_type }})
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="summary--text-icon">LVL</span>
            </div> {{ project.level_applicant }}
          </div>
          <div class="summary--item">
            <div class="summary-icon">
              <span class="summary--text-icon">Pts</span>
            </div> Require Minimal {{ project.min_points }} Points/Person
          </div>
        </div>
      </div>
    </div>
    <button class="contact-button">
      Contact Lecturer
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import * as timeago from 'timeago.js'

import BubbleSkill from '~/components/BubbleSkill'

export default {
  name: 'ProjectDetailsPage',

  components: {
    BubbleSkill
  },

  data () {
    return {
      project: {
        state: 'load',
        user: { photo_url: '' }
      },
      bg: '',
      bgBubble: 'red'
    }
  },

  computed: {
    cssProps () {
      return {
        '--project-details-bg': `url(${this.bg})`
      }
    },

    getFullName () {
      return this.project.user.first_name + ' ' + this.project.user.last_name
    },

    expertiseIn () {
      return this.getExpertise(this.project.ui_ux_designer, this.project.project_expert, this.project.front_end_engineer, this.project.back_end_engineer)
    }
  },

  mounted () {
    this.getDetails()
  },

  methods: {

    getHumanDate: function (date) {
      return timeago.format(date)
    },

    async getDetails () {
      axios.get(`/api/project/${this.$route.params.id}`)
        .then(response => {
          this.project = response.data
          this.bg = `https://placeimg.com/640/360/tech/${this.$route.params.id}`
        })
    },

    getExpertise: function (...expertises) {
      if (expertises[0]) expertises[0] = 'UI/UX Designer'
      if (expertises[1]) expertises[1] = 'Frontend Engineer'
      if (expertises[2]) expertises[2] = 'Backend Engineer'
      if (expertises[3]) expertises[3] = 'Data Expert'

      let results = expertises.filter(expertise => expertise !== 0).join(', ')

      return results
    }

  },

  metaInfo () {
    return { title: 'Home' }
  }
}
</script>

<style lang="css" scoped>

#project-details--image {
  background-image: var(--project-details-bg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  mask-image: url(/images/mask-image.png);
  mask-size: 90%;
  mask-repeat: no-repeat;
  mask-position: center;

  height: 35vh;
  width: 85vw;

  margin: 0 auto;
}

</style>
