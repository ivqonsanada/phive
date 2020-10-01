<template>
  <div>
    <div class="apply__top--container">
      <div class="edit-profile__top-decore">
        <div class="edit-profile__inside-top-decore" />
      </div>
      <h2 class="apply__top--h1">
        You Almost There!
      </h2>
      <p class="apply__top--p">
        You need to fill up the form below about yourself / team who wants to applied to <strong>{{ title }}.</strong>
      </p>
    </div>

    <div class="form-group__container">
      <h4 class="form-group__input-name">
        Applicant Type
      </h4>
      <div class="form-group__radio-container">
        <router-link v-for="type in types" :key="type.name" :to="{ name: type.route, params: { title: title, type: applicant_type } }" class="btn--clear radio__square" active-class="active-type" tag="button">
          {{ type.name }}
        </router-link>
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

  computed: {
    title () {
      return this.$route.params.title
    },

    applicant_type () {
      return this.$route.params.type
    },

    types () {
      let types = [
        {
          name: 'Individual',
          route: 'project.apply.individual'
        },
        {
          name: 'Team',
          route: 'project.apply.team'
        }
      ]

      if (this.applicant_type === 'Individual') {
        return [types[0]]
      }

      if (this.applicant_type === 'Team') {
        return [types[1]]
      }

      return types
    }
  },

  metaInfo () {
    return { title: 'Apply' }
  },

  mounted () {

  },

  methods: {
    async update () {
      await this.form.post('/api/project/')

      this.form.reset()
    }
  }
}
</script>
