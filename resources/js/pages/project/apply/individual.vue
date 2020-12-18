<template>
  <form @submit.prevent="submitIndividual" @keydown="form.onKeydown($event)">
    <div class="">
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Expertise Role
        </h4>
        <div class="form-group__input-container">
          <div class="selectdiv">
            <label>
              <select v-model="form.apply.expertise" class="input--select"
                      placeholder="Select Expertise..."
              >
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
            </label>
          </div>
        </div>
      </div>

      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Tag Name
        </h4>
        <div class="form-group__input-container">
          <input v-model="form.apply.tagname" class="form-group__input-text" disabled>
        </div>
      </div>

      <hr class="form--hr">

      <!-- Tell me about yourself! -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Tell me about yourself!
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.apply.self_describe" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <!-- Why you ? -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Why are you interested in joining this project?
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.apply.apply_reason" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <v-button :loading="form.busy" class="btn btn--red btn--large">
          <span>
            Submit
          </span>
          <span class="iconify" data-icon="si-glyph:paper-plane" data-inline="true" />
        </v-button>
      </div>
    </div>
  </form>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',

  name: 'IndividualApply',

  data: () => ({

    form: new Form({
      apply: {}
    })
  }),

  metaInfo () {
    return { title: 'Apply - Individual' }
  },

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
    }
  }
}
</script>
