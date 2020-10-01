<template>
  <div class="box--container">
    <div class="box--top-container">
      <img class="project-box__item--img" :src="`https://placeimg.com/100/100/tech/${data.id}`" alt="">
      <div class="project-box__item--container">
        <span class="project-box__item--title">{{ data.title }}</span>
        <div class="project-box__item--status" :class="color">
          <template>
            <span class="iconify project-box__item--icon" :data-icon="status.icon" data-inline="true" />
            <span>{{ status.text }}</span>
          </template>
        </div>
        <div class="box__details--container" @click="showDetails">
          <span class="project-box__item--details">Details</span>
          <div v-if="show">
            <span class="iconify box--close-button" data-icon="ion:close" data-inline="true" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="show" class="box--bottom-container">
      <template v-if="data.isAccepted">
        <p class="project-box__item--p">
          You’re Accepted to join this project. Please send the confirmation message to PIC of the project if you’re agree on joining the project by clicking the <strong>"Agree to Join"</strong> button, you have 24 hours to make an agreement to the PIC. It will be change to rejected automatically within 24 hours if you don’t make a confirmation.
        </p>
        <div>
          <div class="box--agree-button">
            Agree to Join
          </div>
        </div>
      </template>
      <template v-else>
        <p>
          Uppsss, You are Rejected :((
        </p>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectBoxItem',

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    show: false
  }),

  computed: {
    status () {
      if (this.data.isAccepted === true) return { icon: 'bi:shield-fill-check', text: 'Accepted' }
      return { icon: 'ic:round-block', text: 'Rejected' }
    },

    color () {
      if (this.data.isAccepted === true) return 'project-box__item--status-blue'
      return 'project-box__item--status-red'
    }
  },

  methods: {
    showDetails () {
      this.show = !this.show
    }
  }
}
</script>

<style scoped>

</style>
