<template>
  <div class="row">
    <div class="col-lg-8 m-auto">
      <card title="Verify Email">
        <template v-if="success">
          <div class="alert alert-success" role="alert">
            {{ success }}
          </div>

          <router-link :to="{ name: 'login' }" class="btn btn-primary">
            Log In
          </router-link>
        </template>
        <template v-else>
          <div class="alert alert-danger" role="alert">
            {{ error || 'Failed to verify email.' }}
          </div>

          <router-link :to="{ name: 'verification.resend' }" class="small float-right">
            Resend Verification Link ?
          </router-link>
        </template>
      </card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const qs = (params) => Object.keys(params).map(key => `${key}=${params[key]}`).join('&')

export default {
  middleware: 'guest',

  metaInfo () {
    return { title: 'Verify Email' }
  },

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
  })
}
</script>
