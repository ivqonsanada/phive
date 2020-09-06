<template>
  <div class="login-page--container" :class="{ 'lecturer-bg': lecturerRole }">
    <div class="login-page--logo">
      <router-link :to="{ name: 'index' }" :class="{ 'lecturer-color': lecturerRole }">
        PHive
      </router-link>
    </div>

    <div class="login-form--container">
      <h1 class="login--h1">
        You are?
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
      <form @submit.prevent="register" @keydown="form.onKeydown($event)">
        <div class="login-input--container">
          <!-- <label class="auth__input--label" for="first_name">First Name</label> -->
          <input v-model="form.first_name" :class="{ 'is-invalid': form.errors.has('first_name') }" class="login-input" type="text" name="first_name" placeholder="First Name">
          <has-error :form="form" field="first_name" />
        </div>

        <div class="login-input--container">
          <!-- <label class="auth__input--label" for="last_name">Last Name</label> -->
          <input v-model="form.last_name" :class="{ 'is-invalid': form.errors.has('last_name') }" class="login-input" type="text" name="last_name" placeholder="Last Name">
          <has-error :form="form" field="last_name" />
        </div>

        <div class="login-input--container">
          <!-- <label class="auth__input--label" for="email">Email</label> -->
          <input v-model="form.email" :class="{ 'is-invalid': form.errors.has('email') }" class="login-input" type="email" name="email" placeholder="Email">
          <has-error :form="form" field="email" />
        </div>

        <!-- Password -->
        <div class="login-input--container">
          <!-- <label class="auth__input--label" for="password">Password</label> -->
          <input v-model="form.password" :class="{ 'is-invalid': form.errors.has('password') }" class="login-input" type="password" name="password" placeholder="Password">
          <has-error :form="form" field="password" />
        </div>

        <div class="">
          <!-- Submit Button -->
          <v-button :loading="form.busy" class="login-submit--button" :class="{ 'is-lecturer': lecturerRole }">
            Sign Up
          </v-button>
        </div>
      </form>

      <div class="login-extra">
        <p>
          Already had an account?
          <router-link :to="{ name: 'login' }" class="login-link">
            <b>Sign In</b>
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
// import LoginWithGithub from '~/components/LoginWithGithub'

export default {
  middleware: 'guest',

  layout: 'wide',

  metaInfo () {
    return { title: 'Register' }
  },

  data: () => ({
    loginRole: 'Student',
    studentRole: false,
    lecturerRole: false,

    form: new Form({
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    }),
    mustVerifyEmail: false
  }),

  methods: {
    async register () {
      // Register the user.
      const { data } = await this.form.post('/api/register')

      // Must verify email fist.
      if (data.status) {
        this.mustVerifyEmail = true
      } else {
        // Log in the user.
        const { data: { token } } = await this.form.post('/api/login')

        // Save the token.
        this.$store.dispatch('auth/saveToken', { token })

        // Update the user.
        await this.$store.dispatch('auth/updateUser', { user: data })

        // Redirect home.
        this.$router.push({ name: 'home' })
      }
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
