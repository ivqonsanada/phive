<template>
  <form @submit.prevent="login" @keydown="form.onKeydown($event)">
    <div class="">
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Expertise Role
        </h4>
        <div class="form-group__input-container">
          <select v-model="form.expertise" class="form-group__input-select"
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
        </div>
      </div>

      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Tag Name
        </h4>
        <div class="form-group__input-container">
          <input v-model="form.tagname" class="form-group__input-text" value="@ivqonsanada" disabled>
        </div>
      </div>

      <hr class="form--hr">

      <!-- Tell me about yourself! -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Tell me about yourself!
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.message" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <!-- Why you ? -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Why are you interested in joining this project?
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.interest" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <v-button :loading="form.busy" class="form__submit-button">
          Submit
          <span class="iconify" data-icon="si-glyph:paper-plane" data-inline="true" />
        </v-button>
      </div>
    </div>
  </form>
</template>

<script>
import Form from 'vform'

export default {
  middleware: 'auth',

  data: () => ({

    form: new Form({
      applicant: 'Individual',
      expertise: 'UI/UX Designer',
      tagname: '@ivqonsanada',
      description: '',
      interest: ''
    })
  }),

  metaInfo () {
    return { title: 'Apply' }
  },

  mounted () {
    // if (!this.$route.params.name) {
    //   this.$router.push({ path: `/project/${this.$route.params.id}` })
    // }
  },

  methods: {
    async update () {
      await this.form.post('/api/project/')

      this.form.reset()
    }
  }
}
</script>
