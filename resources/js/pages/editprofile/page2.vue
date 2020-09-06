<template>
  <div>
    <form @submit.prevent="saveProfile" @keydown="form.onKeydown($event)">
      <div class="">
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Expertise Role
          </h4>
          <div class="form-group__input-container">
            <select v-model="form.user.expertise" class="form-group__input-select"
                    placeholder="Select Expertise..."
            >
              <option value="UI/UX Designer Specialist">
                UI/UX Designer Specialist
              </option>
              <option value="Frontend Engineer Specialist">
                Frontend Engineer Specialist
              </option>
              <option value="Backend Engineer Specialist">
                Backend Engineer Specialist
              </option>
              <option value="Data Expert Specialist">
                Data Expert Specialist
              </option>
            </select>
          </div>
        </div>

        <hr class="form--hr">

        <div>
          <h2 class="social-media__heading">
            Experience
          </h2>
        </div>

        <div class="">
          <router-link :to="{ name: 'editprofile.page1' }" class="edit-profile__link">
            <div class="edit-profile__page-2-button">
              Previous
            </div>
          </router-link>

          <v-button :loading="form.busy" class="form__submit-button">
            Save Changes
          </v-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    form: new Form({
      user: null
    })
  }),

  computed: {
    ...mapGetters({
      data: 'auth/user'
    })
  },

  mounted: function () {
    this.getUser()
  },

  methods: {
    async getUser () {
      this.form.user = this.data
    },

    async saveProfile (e) {
      await this.form.post('/api/user/saveprofile')
        .then(({ data }) => {
          console.log(data)
        })
    }
  }

}
</script>
