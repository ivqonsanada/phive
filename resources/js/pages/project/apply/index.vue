<template>
  <div class="apply__container">
    <div class="apply__top--container">
      <TopImage :type="1" />
      <h2 class="apply__top--h1">
        You Almost There!
      </h2>
      <p class="apply__top--p">
        You need to fill up the form below about yourself / team who wants to applied to <strong>{{ title }}.</strong>
      </p>
    </div>

    <div class="form-group__container">
      <h4 class="form-group__input-name form__input-name">
        Applicant
      </h4>
      <div class="form-group__radio-container">
        <router-link v-for="type in types" :key="type.name" :to="{ name: type.route, params: { title: title, type: applicant_type } }" class="btn btn--white btn--apply" active-class="active-type" tag="button" :disabled="type.isDisabled">
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
  name: 'ApplyIndex',

  middleware: ['auth', 'student'],

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
          route: 'project.apply.individual',
          isDisabled: this.$route.params.type === 'Team'
        },
        {
          name: 'Team',
          route: 'project.apply.team',
          isDisabled: this.$route.params.type === 'Individual'
        }
      ]

      return types
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
