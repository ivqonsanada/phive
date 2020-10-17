<template>
  <div>
    <div class="inbox__info--container">
      <img class="profile__info--img" :src="user.avatar" alt="">
      <div class="profile__info--desc">
        <p class="profile__info--name">
          {{ getFullName }}
        </p>
        <p class="profile__info--occupation">
          {{ user.major }}
          <template v-if="user.role === 'Student'">
            Major
          </template>
          <br>
          {{ user.university }} <br>
          {{ user.location }}
        </p>
        <p class="profile__info--expertise">
          <span class="iconify" data-icon="fa-solid:paint-brush" data-inline="true" width="15" height="10" /> {{ user.expertise }}
        </p>
        <template v-if="user.role === 'Student'">
          <p class="profile__info--available">
            <span class="iconify" data-icon="carbon:dot-mark" data-inline="true" width="15" height="15" />
            Available
          </p>
        </template>
        <template v-else-if="user.role === 'Lecturer'">
          <p class="profile__info--verified">
            <span class="iconify" data-icon="bi:shield-fill-check" data-inline="true" width="15" height="15" />
            Verified
          </p>
        </template>
      </div>
    </div>

    <div class="inbox--top">
      <div class="inbox--top-left">
        <span class="iconify inbox--left-icon" data-icon="ion:mail-unread-sharp" data-inline="true" /> <h2 class="inbox--heading">
          Inbox
        </h2>
      </div>
      <div><span class="iconify inbox--right-icon" data-icon="ic:round-filter-list" data-inline="true" /></div>
    </div>
    <div class="inbox--container">
      <InboxItem v-for="inbox in inboxes" :key="`inbox-${inbox.id}`" :data="inbox" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import InboxItem from '~/components/InboxItem.vue'

export default {
  components: {
    InboxItem
  },

  metaInfo () {
    return { title: 'Home' }
  },

  data: () => ({
    title: 'Home'
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      inboxes: 'notification/inbox'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    }
  },

  mounted () {
    this.getInbox()
  },

  methods: {
    async getInbox () {
      this.$store.dispatch('notification/fetchInbox')
    }
  }
}
</script>
