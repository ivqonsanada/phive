<template>
  <div class="project__card--container">
    <div class="project__card--top-container pointer">
      <router-link :to="{ name: 'project.details', params: { id: project.project_url } }">
        <img :src="project.thumbnail_url" height="150">
        <!-- loading="lazy" -->
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
              Posted by : {{ project.user.full_name }}
            </div>
            <div class="ellipsies">
              Applicant : {{ project.applicant_type }}
            </div>
          </div>
          <div>
            <div class="project__card--bounty-info">
              <div class="info-item--container">
                <span class="bounty--span">LVL</span>
                <span>{{ project.level_applicant ? project.level_applicant : 'Not Specified' }}</span>
              </div>
              <div v-if="project.salary" class="info-item--container">
                <span>
                  <span
                    class="iconify info-item--icon"
                    data-icon="fa-solid:dollar-sign"

                    width="8"
                    height="15"
                  />
                </span>
                <span>Salary</span>
              </div>
              <div v-if="project.certificate" class="info-item--container">
                <span>
                  <span
                    class="iconify info-item--icon"
                    data-icon="la:certificate-solid"

                    width="15"
                    height="15"
                  />
                </span>
                <span>Certificate</span>
              </div>
            </div>
            <div class="project-card__extra-info--container">
              <div class="project-card__extra-info">
                <div>&bull; Posted {{ getHumanDate(project.created_at) }}</div>
                <div>&bull; Max. {{ project.max_person }} Person</div>
              </div>
              <button v-if="$matchMedia.xl && (!user || user.role === 'Student' )" class="btn--clear" @click="showWishlist">
                <span class="iconify project-card__wish" data-icon="mdi:dots-horizontal" width="22" />
              </button>
              <div v-show="showWish" class="card-wish__container">
                <button v-debounce:400ms="toggleWishlist" class="btn btn--clear card-wish__button" :debounce-events="'click'">
                  {{ wishText }}
                </button>
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
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectCard',

  props: {
    data: { type: Object, default: null }
  },

  data: () => {
    return {
      showWish: ''
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    }),

    expertiseIn () {
      const expertises = [
        { name: 'UI/UX Designer', isRequired: this.project.ui_ux_designer },
        { name: 'Frontend Engineer', isRequired: this.project.front_end_engineer },
        { name: 'Backend Engineer', isRequired: this.project.back_end_engineer },
        { name: 'Data Expert', isRequired: this.project.data_expert }
      ].filter(expertise => expertise.isRequired === true)
        .map(expertise => expertise.name)
        .join(', ')

      if (expertises === '') return 'Not Specified'

      return expertises
    },

    rewards () {
      return this.getRewards({
        salary: this.project.salary,
        currency: this.project.currency,
        salaryAmount: this.project.salary_amount,
        paymentType: this.project.payment_type,
        certificate: this.project.certificate,
        maxPerson: this.project.max_person
      })
    },

    project () {
      if (this.data.project) return this.data.project

      return this.data
    },

    wishText () {
      if (this.project.is_wished && this.project.is_wished.status) {
        return 'Remove from Wishlist'
      }

      return 'Add to Wishlist'
    }
  },

  methods: {

    getRewards: function ({ salary, currency, salaryAmount, paymentType, certificate, maxPerson }) {
      if (paymentType === 'person') salaryAmount = salaryAmount * maxPerson
      if (salary) {
        return new Intl.NumberFormat('id-ID').format(salaryAmount) + ',- ' + currency
      } else if (certificate) return 'Certificate'
      else return 'Not Specified'
    },

    getHumanDate: function (date) {
      return timeago.format(date)
    },

    showWishlist () {
      this.showWish = !this.showWish
    },

    async toggleWishlist () {
      const isWished = this.project.is_wished && this.project.is_wished.status

      await axios.post(`/api/project/${this.project.project_url}/wishlist`, {
        status: !isWished
      })
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('auth/updateWishlists', {
            wishlists: data.wishlists
          })
          if (this.project.is_wished) {
            this.project.is_wished.status = !this.project.is_wished.status
          } else {
            this.project.is_wished = {
              status: true
            }
          }
        }).catch((e) => {
          this.snackbar.open(e.response.data.message)
          this.$router.push({ name: 'login' })
          // console.log(error.response)
        })
    }
  }
}
</script>
