<template>
  <div class="review__container">
    <TopImage :type="2" />

    <h2 class="review__h2">
      Review Project
    </h2>
    <div class="review-top__container">
      <img class="review__image" :src="detail.project.thumbnail_url" alt="">
      <h3 class="review__title">
        {{ detail.project.title }}
      </h3>
    </div>

    <form @submit.prevent="postReview" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="review__overall--container">
          <h4 class="review__overall--score">
            Overall Score
          </h4>
          <div class="review__overall--dots">
            :
          </div>
          <div class="w-100">
            <input v-model="form.overall_score" class="form-group__input-text" placeholder="Scale is 0.0 - 5.0" type="number" step="0.1" min="0.0" max="5.0" required>
          </div>
        </div>
        <has-error :form="form" field="email" />

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Overall Review
          </h4>
          <div class="">
            <textarea v-model="form.overall_review" class="form-group__input-textarea" placeholder="Max. 500 words" rows="8" />
          </div>
        </div>

        <div class="separator-short mt-3 mb-3" />

        <div>
          <h4 class="review__h4">
            Project Participants
          </h4>

          <div class="review__participant--list">
            <div v-for="(participant, index) in detail.participants" :key="`ProjectParticipant-${index}`">
              <div class="review-participant__left-container">
                <div class="review__participant--container">
                  <div class="review__participant--img">
                    <img :src="participant.member.avatar" class="review__participant--img" alt="">
                  </div>
                  <div class="review__participant--info">
                    <p><b>Member</b></p>
                    <p>{{ participant.member.full_name }}</p>
                    <p>{{ participant.expertise }}</p>
                  </div>
                </div>
                <div v-if="$matchMedia.xl" class="form-group__container review-score__container">
                  <h4 class="form-group__input-name post__h4">
                    Student Score
                  </h4>
                  <div class="">
                    <input v-model="form.participants[index].score" class="form-group__input-text" placeholder="Write down your student score" type="number" step="0.1" min="0.0" max="5.0" required>
                  </div>
                </div>
              </div>
              <div class="mb-1_5">
                <h4 class="form-group__input-name post__h4">
                  Assessment
                </h4>
                <div class="">
                  <textarea v-model="form.participants[index].assessment" class="form-group__input-textarea" placeholder="Write down your assessment" rows="5" />
                </div>
              </div>
              <div v-if="!$matchMedia.xl" class="form-group__container">
                <h4 class="form-group__input-name">
                  Student Score
                </h4>
                <div class="">
                  <input v-model="form.participants[index].score" class="form-group__input-text" placeholder="Write down your student score" type="number" step="0.1" min="0.0" max="5.0">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="separator-short mt-3 mb-3" />

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Project Result
          </h4>
          <div class="social-media__edit-input--container">
            <span class="iconify social-media__edit--icon" data-icon="whh:website" />
            <input v-model="form.project_result" type="url" class="social-media__input" :placeholder="`e.g., project.github.io`">
          </div>
        </div>

        <button class="btn btn--large btn--blue mt-3 ml-auto">
          Post Review
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ReviewProject',
  layout: 'back',
  middleware: ['auth', 'lecturer'],

  metaInfo () { return { title: 'Review Project' } },

  data: () => ({
    detail: {
      project: {
        title: ''
      }
    },

    form: new Form({
      overall_score: '',
      overall_review: '',
      project_result: '',
      participants: [
        { assessment: '', score: '' }
      ]
    })
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    this.getDetails()
  },

  methods: {
    async getDetails () {
      await axios.get(`/api` + this.$route.path)
        .then(({ data }) => {
          this.detail = data
          this.transformApiToForm()
        })
    },

    transformApiToForm () {
      this.form.participants = this.detail.participants.map(e => {
        return { member_id: e.member_id, assessment: '', score: '', expertise: e.expertise }
      })
    },

    async postReview () {
      this.form.submit('post', `/api/project/${this.detail.project.project_url}/review`)
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$router.push({ name: 'projectbox' })
        }).catch(e => {
          this.snackbar.open(e.response.data.message)
        })
    }
  }
}
</script>
