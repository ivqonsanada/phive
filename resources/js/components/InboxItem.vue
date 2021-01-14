<template>
  <div class="project-box__container">
    <InboxItemMessage v-if="data.category === 'Message'" :data="data" />

    <template v-else-if="user.role === 'Student'">
      <InboxItemAcceptProject v-if="data.category === 'Project Invitation'" :data="data" />
      <InboxItemAcceptTeam v-else-if="data.category === 'Team Invitation'" :data="data" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import InboxItemAcceptProject from './InboxItem/InboxItemAcceptProject'
import InboxItemAcceptTeam from './InboxItem/InboxItemAcceptTeam'
import InboxItemMessage from './InboxItem/InboxItemMessage.vue'

export default {
  name: 'IndexItem',

  components: { InboxItemAcceptProject, InboxItemAcceptTeam, InboxItemMessage },

  props: {
    data: { type: Object, default: null }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  }
}
</script>
