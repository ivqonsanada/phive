<template>
  <div class="project-details--container">
    <div class="details--top-container">
      <div>
        <div v-show="!project">
          <content-placeholders :rounded="true">
            <content-placeholders-img />
            <content-placeholders-heading />
          </content-placeholders>
        </div>
        <div v-show="project" class="project-details--image-container">
          <div id="project-details--image" :style="cssProps" />
        </div>
      </div>
      <h1 class="project-details--h1">
        {{ project.title }}
      </h1>
      <div class="project-details--action-button">
        <router-link class="btn btn--red btn--large" :to="{ name: applyRoute, params: { title: project.title, type: project.applicant_type } }" tag="button">
          Apply Project
        </router-link>
        <button class="btn btn--white btn--large" @click="addWishlist">
          <span class="iconify" data-icon="ic:round-add-circle-outline" data-inline="true" width="24" height="24" />
          <span>Wishlist</span>
        </button>
      </div>
      <h2 id="project-details" v-scroll-to="'#project-details'" class="project-details--h2">
        <a href="#project-details" class="button__project--more">
          <span class="iconify" data-icon="zmdi:more" data-inline="false" />
          <span>
            Project Details
          </span>
        </a>
      </h2>
    </div>
    <div class="project-details--main-body">
      <div class="project-details__lecturer-info">
        <div class="lecturer-info--left">
          <router-link :to="{ path: '/@/' + project.user.tagname }" class="lencturer-text-link">
            <div class="lecturer-info--image-container">
              <img :src="project.user.avatar" :alt="`${fullName} Photo Profile`">
            </div>

            <div>
              <div><strong>Posted By</strong></div>
              <div>{{ fullName }}</div>
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
          <li v-for="req in project.project_requirements" :key="req.id">
            {{ req.requirement }}
          </li>
        </ul>
      </div>
      <div class="project-skills">
        <h3>Skills</h3>
        <div class="skills--container">
          <BubbleSkill v-for="skill in project.project_skills" :key="skill.id" :color="bgBubble" :name="skill.skill" />
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
    <router-link :to="{ name: 'message', params: { tagname: project.user.tagname } }" class="btn btn--red btn--large" tag="button">
      Contact Lecturer
    </router-link>
  </div>
</template>

<script>
import * as timeago from 'timeago.js'

import BubbleSkill from '~/components/BubbleSkill'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProjectDetailsPage',

  components: {
    BubbleSkill
  },

  data: () => ({
    bgBubble: 'red'
  }),

  computed: {
    ...mapGetters({
      project: 'visit/project',
      snackbar: 'notification/snackbar'
    }),

    cssProps () {
      return {
        '--project-details-bg': `url(https://placeimg.com/640/360/tech/${this.$route.params.id})`
      }
    },

    fullName () {
      return this.project.user.first_name + ' ' + this.project.user.last_name
    },

    applyRoute () {
      if (this.project.applicant_type === 'Team') return 'project.apply.team'
      return 'project.apply.individual'
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
      await this.$store.dispatch('visit/fetchVisitedProject', {
        id: this.$route.params.id
      })
    },

    async addWishlist () {
      await axios.post(`/api/project/${this.$route.params.id}/wishlist`)
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('auth/updateWishlists', {
            wishlists: data.wishlists
          })
        })
    }
  },

  metaInfo () {
    return { title: this.project.title }
  }
}
</script>

<style scoped>

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
  max-width: 510px;

  margin: 0 auto;
}

</style>
