<template>
  <div>
    <h2 class="newcomer__h2 mb-3">
      Personal Information
    </h2>
    <div class="form-avatar-group__container">
      <img class="edit-profile--img" :src="data.avatar" alt="">
      <div class="form-group__input-container form__file-container">
        <div>
          <label for="form2.avatar" class="btn btn--red">Upload Photo</label>
          <input id="form2.avatar" class="form__input-file" name="form2.file" type="file" @change="uploadAvatar">
        </div>
        <button class="btn btn--grey">
          Delete
        </button>
      </div>
    </div>

    <form @submit.prevent="saveProfile" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            First Name
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.first_name" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Last Name
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.last_name" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Status
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.role" class="form-group__input-text" disabled>
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            {{ form.user.role }} ID Number
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.identity_number" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            University
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.university" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Faculty
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.faculty" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Major
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.major" class="form-group__input-text">
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Location
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.user.location" class="form-group__input-text">
          </div>
        </div>

        <!-- Tell me about yourself! -->
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Biography
          </h4>
          <div class="form-group__input-container">
            <textarea v-model="form.user.biography" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
          </div>
        </div>

        <hr class="form--hr">

        <div>
          <h2 class="social-media__heading">
            Social Media
          </h2>
          <div class="social-media__container">
            <div class="social-media__input-container">
              <span class="iconify social-media__icon" data-icon="ant-design:behance-outlined" data-inline="true" />
              <input v-model="form.user.behance" type="text" class="social-media__input" :placeholder="`e.g., behance.net/${form.user.first_name}`">
            </div>

            <div class="social-media__input-container">
              <span class="iconify social-media__icon" data-icon="ant-design:github-filled" data-inline="true" />
              <input v-model="form.user.github" type="text" class="social-media__input" :placeholder="`e.g., github.com/${form.user.first_name}`">
            </div>

            <div class="social-media__input-container">
              <span class="iconify social-media__icon" data-icon="brandico:linkedin" data-inline="true" />
              <input v-model="form.user.linkedin" type="text" class="social-media__input" :placeholder="`e.g., linkedin.com/in/${form.user.first_name}`">
            </div>

            <div class="social-media__input-container">
              <span class="iconify social-media__icon" data-icon="whh:dribbblealt" data-inline="true" />
              <input v-model="form.user.dribbble" type="text" class="social-media__input" :placeholder="`e.g., dribbble.com/${form.user.first_name}`">
            </div>

            <div class="social-media__input-container">
              <span class="iconify social-media__icon" data-icon="whh:website" data-inline="true" />
              <input v-model="form.user.website" type="text" class="social-media__input" :placeholder="`e.g., ${form.user.first_name}.github.io`">
            </div>
          </div>
        </div>

        <hr class="form--hr">

        <div class="form-group__container mb-5">
          <h4 class="form-group__input-name ">
            Tag Name
          </h4>
          <div class="form-group__input-container form-tag__group">
            <label for="form.user.tagname" class="form-tag">@</label>
            <input id="form.user.tagname" v-model="form.user.tagname" class="form-group__input-text ">
          </div>
        </div>
        <div class="">
          <router-link :to="{ name: 'newcomer.page2' }" class="btn btn--red" tag="button" @click="saveProfile">
            Next
          </router-link>

          <!-- @click="saveProfile" -->
          <!-- <v-button :loading="form.busy" class="btn btn--red">
            Save Changes
          </v-button> -->
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { serialize } from 'object-to-formdata'
import { mapGetters } from 'vuex'
// import snarkdown from 'snarkdown'

export default {
  name: 'EditProfilePageOne',

  data: () => ({
    form: new Form({
      user: {
        first_name: ''
      }
    }),

    form2: new Form({
      file: null
    })
  }),

  computed: {
    ...mapGetters({
      data: 'auth/user',
      snackbar: 'notification/snackbar'
    })
  },

  mounted: function () {
    this.getUser()
  },

  beforeDestroy () {
    this.saveProfile()
  },

  methods: {
    async getUser () {
      this.form.user = this.data

      this.form.user.tagname = this.data.first_name + this.data.id
    },

    async uploadAvatar (e) {
      const file = e.target.files[0]

      // Do some client side validation...

      this.form.file = file

      this.form.submit('post', '/api/user/uploadavatar', {
        transformRequest: [function (data, headers) {
          return serialize(data)
        }]
      })
        .then(({ data }) => {
          this.$store.dispatch('auth/updateAvatar', {
            avatar: data.avatar
          })

          this.snackbar.open(data.message)
        })
    },

    async saveProfile () {
      this.form.post('/api/user/saveprofile/1')
        .then(({ data }) => {
          this.$store.dispatch('auth/updateUser', {
            user: data.user
          })
        })
    }
  }

}
</script>
