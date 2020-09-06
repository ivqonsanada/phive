<template>
  <div class="login-page--container" :class="{ 'lecturer-bg': lecturerRole }">
    <div class="login-page--logo">
      <router-link :to="{ name: 'index' }" :class="{ 'lecturer-color': lecturerRole }">
        <img src="/images/logo.svg" alt="">
      </router-link>
    </div>

    <div class="login-form--container">
      <h1 class="login--h1">
        Who are you?
      </h1>
      <div class="login-role--container">
        <div>
          <input id="login-student" v-model="loginRole" class="login-radio" type="radio" value="Student" name="role">
          <label class="login-radio--label" for="login-student" @click="chooseStudent">Student</label>
        </div>
        <div>
          <input id="login-lecturer" v-model="loginRole" class="login-radio" type="radio" value="Lecturer" name="role">
          <label class="login-radio--label" for="login-lecturer" @click="chooseLecturer">Lecturer</label>
        </div>
      </div>
      <div class="role--choose-effect" :class="{ 'role--student': studentRole, 'role--lecturer': lecturerRole }" />
      <form @submit.prevent="login" @keydown="form.onKeydown($event)">
        <!-- Email -->
        <div class="login-input--container">
          <input v-model="form.email" :class="{ 'is-invalid': form.errors.has('email') }" class="login-input" type="email" name="email" placeholder="Email">
          <has-error :form="form" field="email" />
        </div>

        <!-- Password -->
        <div class="login-input--container">
          <input v-model="form.password" :class="{ 'is-invalid': form.errors.has('password') }" class="login-input" type="password" name="password" placeholder="Password">
          <has-error :form="form" field="password" />
        </div>

        <!-- Remember Me -->
        <div class="login-input--container">
          <checkbox v-model="remember" name="remember" class="input-remember">
            Remember Me
          </checkbox>
        </div>

        <div class="">
          <!-- Submit Button -->
          <v-button :loading="form.busy" class="login-submit--button" :class="{ 'is-lecturer': lecturerRole }">
            Sign In
          </v-button>
        </div>
      </form>
      <div class="login-extra">
        <p>
          Don't have an account?
          <router-link :to="{ name: 'register' }" class="login-link">
            <b>Sign Up</b>
          </router-link>
        </p>
        <p>
          <router-link :to="{ name: 'password.request' }" class="login-link">
            <b>Forgot Password?</b>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Form from 'vform'

export default {
  middleware: 'guest',

  layout: 'wide',

  metaInfo () {
    return { title: 'Log In' }
  },

  data: () => ({
    loginRole: 'Student',
    studentRole: false,
    lecturerRole: false,

    form: new Form({
      email: '',
      password: ''
    }),
    remember: false
  }),

  methods: {
    async login () {
      const { data } = await this.form.post('/api/login')

      this.$store.dispatch('auth/saveToken', {
        token: data.token,
        remember: this.remember
      })

      await this.$store.dispatch('auth/fetchUser')

      this.$router.back()
    },

    chooseStudent () {
      this.studentRole = true
      this.lecturerRole = false
    },
    chooseLecturer () {
      this.lecturerRole = true
      this.studentRole = false
    }
  }
}
</script>
