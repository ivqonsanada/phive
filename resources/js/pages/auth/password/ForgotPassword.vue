<template>
  <div class="forgot-password__container">
    <TopImage :type="1" />
    <h2 class="forgot-password__h2 text-center">
      Don’t worry if you forgot your password
    </h2>

    <p class="forgot-password__p">
      Don’t worry! Resetting your password is easy. Just type in this email field below that you registered on Phive.
    </p>

    <form class="forgot-password__form--container" @submit.prevent="send" @keydown="form.onKeydown($event)">
      <!-- Email -->
      <div>
        <div class="login-input--container mb-5 flex-row justify-center">
          <div class="input-w-100-sm">
            <input v-model="form.email" :class="{ 'is-invalid': form.errors.has('email') }" class="forgot-password__input" type="email" name="email" placeholder="e.g., johndoe77@example.ac.id" autocomplete="username" required>
            <has-error :form="form" field="email" />
          </div>
          <v-button v-if="$matchMedia.xl" :loading="form.busy" class="btn btn--blue ml-2">
            Send
          </v-button>
        </div>

        <p class="forgot-password__further-information">
          For further information. Please kindly reach out to <a href="mailto:phive77@gmail.com">phive77@gmail.com</a>
        </p>
      </div>

      <!-- Submit Button -->
      <v-button v-if="!$matchMedia.xl" :loading="form.busy" class="btn btn--blue btn--large">
        Send
      </v-button>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  middleware: 'guest',

  layout: 'back',

  metaInfo () {
    return { title: 'Forgot Password' }
  },

  data: () => ({
    status: '',
    form: new Form({
      email: ''
    })
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    this.$store.dispatch('navigation/changeTitle', {
      title: 'Forgot Password'
    })
  },

  methods: {
    async send () {
      await this.form.post('/api/password/email')
        .then(({ data }) => {
          this.snackbar.open(data.status)
        })

      this.$router.push({ name: 'login' })
    }
  }
}
</script>
