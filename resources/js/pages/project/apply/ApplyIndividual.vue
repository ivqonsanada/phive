<template>
  <form @submit.prevent="submitIndividual" @keydown="form.onKeydown($event)">
    <div class="">
      <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          Expertise Role
        </h4>
        <div class="select">
          <select v-model="form.apply.expertise">
            <option value="UI/UX Designer">
              UI / UX Designer
            </option>
            <option value="Frontend Engineer">
              Frontend Engineer
            </option>
            <option value="Backend Engineer">
              Backend Engineer
            </option>
            <option value="Data Expert">
              Data Expert
            </option>
          </select>
          <span class="focus" />
        </div>
      </div>

      <div class="form-group__container mb-5">
        <h4 class="form-group__input-name form__input-name">
          Tag Name
        </h4>
        <div class=" form-tag__group">
          <input v-model="form.apply.tagname" class="form-tag__input" disabled>
          <label class="form-tag"><span class="iconify" data-icon="entypo:email" /></label>
        </div>
      </div>

      <hr class="form--hr">

      <!-- Tell me about yourself! -->
      <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          Tell me about yourself!
        </h4>
        <div class="">
          <textarea v-model="form.apply.self_describe" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <!-- Why you ? -->
      <div class="form-group__container">
        <h4 class="form-group__input-name form__input-name">
          Why are you interested in joining this project?
        </h4>
        <div class="">
          <textarea v-model="form.apply.apply_reason" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <v-button :loading="form.busy" class="btn btn--blue btn--large apply__btn-submit">
          <span>
            Submit
          </span>
          <span class="iconify" data-icon="si-glyph:paper-plane" />
        </v-button>
      </div>
    </div>
  </form>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  name: 'ApplyIndividualPage',

  middleware: ['auth', 'student'],

  metaInfo () { return { title: 'Apply - Individual' } },

  data: () => ({
    form: new Form({
      apply: {}
    })
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    if (!this.$route.params.title) {
      this.$router.push({ path: `/project/${this.$route.params.id}` })
    }

    this.getUser()
  },

  methods: {
    async getUser () {
      this.form.apply = {
        expertise: this.user.expertise,
        tagname: this.user.tagname,
        self_describe: '',
        apply_reason: '',
        project_id: this.$route.params.id
      }
    },

    async submitIndividual () {
      await this.form.post('/api' + this.$route.path)
        .then(({ data }) => {
          this.snackbar.open(data.message)
        })
        .then(e => {
          this.$router.push({ path: `/project/${this.$route.params.id}` })
        })
        .catch(e => {
          this.snackbar.open(e.response.data.message)
        })
    }
  }
}
</script>
