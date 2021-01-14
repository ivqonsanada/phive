<template>
  <div class="email-check--container">
    <div>
      <router-link :to="{ name: 'index' }">
        <TopImage :type="1" />
      </router-link>

      <h2 class="email-check--heading">
        Kindly Check Your Email for Activation
      </h2>
      <p class="mb-2_5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci lectus purus mi nam. Turpis sit lectus a libero fermentum, varius sem. At faucibus proin blandit risus etiam felis quam. Risus, neque tortor vel placerat convallis sodales nunc aliquet ligula.
      </p>

      <p class="text-center">
        Didn't get an email?

        <button v-debounce:400ms="resend" class="pointer btn--clear" :debounce-events="'click'">
          <b>Resend Activation Email</b>
        </button>
      </p>

      <!-- <has-error :form="form" field="email" /> -->
    </div>

    <router-link :to="{ name: 'index' }" class="text-center">
      <img src="/images/email-check.png" class="email-check--img" alt="">
    </router-link>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  middleware: 'guest',

  layout: 'wide',

  metaInfo () {
    return { title: 'Verify Email' }
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
    if (this.$route.params.email) {
      this.form.email = this.$route.params.email
    }
  },

  methods: {
    async resend () {
      this.form.post('/api/email/resend')
        .then(({ data }) => {
          this.snackbar.open(data.status)
        })
        .catch(({ response }) => {
          this.snackbar.open(response.data.message)
          this.$router.push({ name: 'verification.resend' })
        })
    }
  }
}
</script>
