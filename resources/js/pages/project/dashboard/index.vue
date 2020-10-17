<template>
  <div class="project-dashboard__container">
    <div>
      <h2 class="project-dashboard__h2">
        Congratulations!
      </h2>
      <p class="project-dashboard__subtitle">
        You’ve been selected to be the part of this Project.
      </p>
      <div v-show="!project">
        <content-placeholders :rounded="true">
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </div>
      <div v-show="project" class="project-details--image-container">
        <div class="project-details--image" :style="cssProps" />
      </div>
    </div>
    <h1 class="project-details--h1">
      {{ project ? project.title : '' }}
    </h1>
    <h3 class="project-dashboard__h3">
      List of Team
    </h3>
    <div class="project-dashboard__list-team">
      <div class="project-dashboard__list-team--item">
        <img src="https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm" alt="" class="project-dashboard__list-team--img">
        <div class="project-dashboard__list-team--name">
          Alfonso Hummingbird
        </div>
      </div>
      <div class="project-dashboard__list-team--item">
        <img src="https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm" alt="" class="project-dashboard__list-team--img">
        <div class="project-dashboard__list-team--name">
          Alfonso Hummingbird
        </div>
      </div>
      <div class="project-dashboard__list-team--item">
        <img src="https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm" alt="" class="project-dashboard__list-team--img">
        <div class="project-dashboard__list-team--name">
          Alfonso Hummingbird
        </div>
      </div>
    </div>
    <p class="project-dashboard__p">
      Please contact your lecturer for your further information about the project.
    </p>
    <h2 id="project-details" v-scroll-to="'#project-details'" class="project-details--h2">
      <a href="#project-details" class="button__project--more">
        <span class="iconify" data-icon="zmdi:more" data-inline="false" />
        <span>
          Project Details
        </span>
      </a>
    </h2>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  metaInfo () {
    return { title: 'Project' }
  },

  data: () => ({

  }),

  computed: {
    ...mapGetters({
      project: 'visit/project',
      user: 'auth/user'
    }),

    fullName () {
      return this.user.first_name + ' ' + this.user.last_name
    },

    cssProps () {
      return {
        '--project-details-bg': `url(https://placeimg.com/640/360/tech/${this.$route.params.id})`
      }
    }
  },

  mounted () {
    this.getDetails()
  },

  methods: {

    // getHumanDate: function (date) {
    //   return timeago.format(date)
    // },

    async getDetails () {
      await this.$store.dispatch('visit/fetchVisitedProject', {
        id: this.$route.params.id
      })
    }
  }

}
</script>

<style>
</style>
