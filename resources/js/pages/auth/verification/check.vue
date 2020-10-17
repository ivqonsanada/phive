<template>
  <div class="email-check--container">
    <div>
      <div class="top-img__1--container">
        <div class="top-img__1--background">
          <router-link :to="{ name: 'index' }" class="login-link">
            <div class="top-img__1--logo" />
          </router-link>
        </div>
      </div>

      <h2 class="email-check--heading">
        Kindly Check Your Email for Activation
      </h2>
      <p class="mb-2_5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci lectus purus mi nam. Turpis sit lectus a libero fermentum, varius sem. At faucibus proin blandit risus etiam felis quam. Risus, neque tortor vel placerat convallis sodales nunc aliquet ligula.
      </p>

      <p class="text-center">
        Didn't get an email?
        <span @click="resend">
          <b>Resend Activation Email</b>
        </span>
      </p>
    </div>

    <img src="/images/check-mail.png" class="email-check--img" alt="">
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

  // created () {
  //   if (this.$route.query.email) {
  //     this.form.email = this.$route.query.email
  //   }
  // },
  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    this.form.email = this.$route.params.email
  },

  methods: {
    async resend () {
      const { data } = await this.form.post('/api/email/resend')

      this.snackbar.open(data.status)
    }
  }
}
</script>
