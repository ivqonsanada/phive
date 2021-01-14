<template>
  <div class="verify__container">
    <router-link :to="{ name: 'index' }">
      <TopImage :type="1" />
    </router-link>

    <Icon :icon="state.icon" :classes="'verify__icon'" :width="150" :height="150" />

    <h2 class="verify__heading">
      {{ state.heading }}
    </h2>
    <p class="text-center primary-color">
      {{ state.subtitle }}
    </p>

    <router-link :to="{ name: state.route }" class="btn btn--blue verify__button" tag="button">
      <span>{{ state.buttonText }}</span>
    </router-link>
  </div>
</template>

<script>
import axios from 'axios'

const qs = (params) => Object.keys(params).map(key => `${key}=${params[key]}`).join('&')

export default {
  middleware: 'guest',
  layout: 'wide',

  metaInfo () { return { title: 'Verify Email' } },

  async beforeRouteEnter (to, from, next) {
    try {
      const { data } = await axios.post(`/api/email/verify/${to.params.id}?${qs(to.query)}`)

      next(vm => { vm.success = data.status })
    } catch (e) {
      next(vm => { vm.error = e.response.data.status })
    }
  },

  data: () => ({
    error: '',
    success: ''
  }),

  computed: {
    state () {
      if (this.success) {
        return {
          heading: 'Activation Succeed!',
          subtitle: "You’ve successfully activate your account! Let's Sign In to strengthen your password memory and explore projects that you liked!",
          icon: 'clarity:success-standard-solid',
          buttonText: 'Sign In',
          route: 'login'
        }
      }

      return {
        heading: 'Activation Failed!',
        subtitle: this.error || 'Failed to verify email.',
        icon: 'clarity:times-circle-solid',
        buttonText: 'Resend Verification',
        route: 'verification.resend'
      }
    }
  }
}
</script>
