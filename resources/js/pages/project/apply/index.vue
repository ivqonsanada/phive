<template>
  <div>
    <div class="apply__top--container">
      <div class="edit-profile__top-decore">
        <div class="edit-profile__inside-top-decore" />
      </div>
      <h1 class="apply__top--h1">
        You Almost There!
      </h1>
      <p class="apply__top--p">
        You need to fill up the form below about yourself / team who wants to applied to <strong>{{ $route.params.name }}.</strong>
      </p>
    </div>

    <div class="form-group__container">
      <h4 class="form-group__input-name">
        Applicant Type
      </h4>
      <div class="form-group__radio-container">
        <div>
          <input id="apply-individual" v-model="applicant_type" class="form-group__radio" value="Individual" type="radio" name="applicant_type">
          <router-link :to="{ name: 'project.apply.individual', params: { name: $route.params.name } }" class="radio__square" active-class="active-type">
            <label for="apply-individual">Individual</label>
          </router-link>
        </div>
        <div>
          <input id="apply-team" v-model="applicant_type" class="form-group__radio" value="Team" type="radio" name="applicant_type">
          <router-link :to="{ name: 'project.apply.team', params: { name: $route.params.name } }" class="radio__square" active-class="active-type">
            <label for="apply-team">Team</label>
          </router-link>
        </div>
      </div>
    </div>

    <div>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
// import Form from 'vform'

export default {
  middleware: 'auth',

  data: () => ({
    applicant_type: ''
  }),

  metaInfo () {
    return { title: 'Apply' }
  },

  mounted () {
    if (!this.$route.params.name) {
      this.$router.push({ path: `/project/${this.$route.params.id}` })
    }
  },

  methods: {
    async update () {
      await this.form.post('/api/project/')

      this.form.reset()
    }
  }
}
</script>
