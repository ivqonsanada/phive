<template>
  <div class="settings__container">
    <TopImage :type="1" />

    <div class="settings-form--container">
      <form @submit.prevent="update" @keydown="form.onKeydown($event)">
        <!-- Password -->
        <h2 class="settings__h3">
          Change Password
        </h2>

        <div class="login-input--container">
          <input v-model="form.password" class="login-input" placeholder="New Password" type="password" required>
          <has-error :form="form" field="password" />
        </div>

        <div class="login-input--container">
          <input v-model="form.password_confirmation" class="login-input" placeholder="Re-Type New Password" type="password" required>
          <has-error :form="form" field="password_confirmation" />
        </div>

        <v-button :loading="form.busy" class="btn btn--blue ml-auto">
          Save Changes
        </v-button>
      </form>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  name: 'SettingsPage',

  middleware: ['auth'],

  metaInfo () { return { title: 'Settings' } },

  data: () => ({
    form: new Form({
      password: '',
      password_confirmation: ''
    })
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  methods: {
    async update () {
      this.form.patch('/api/settings/password')
        .then(response => {
          this.snackbar.open('Password has been changed')
        })
    }
  }
}
</script>
