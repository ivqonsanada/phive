<template>
  <div class="inbox__container">
    <h2 v-if="$matchMedia.xl" class="desktop-inbox__heading">
      Inbox
    </h2>
    <div class="inbox__body--container">
      <div class="inbox__info--container">
        <img class="inbox__info--img" :src="user.avatar" alt="">
        <div class="inbox__info--desc">
          <p class="inbox__info--name">
            {{ user.full_name }}
          </p>
          <p class="inbox__info--occupation">
            {{ user.major }}
            <!-- <span v-if="user.role === 'Student'">
              Major
            </span> -->
            <br>
            {{ user.university }} <br>
            {{ user.location }}
          </p>
          <p v-if="!$matchMedia.xl" class="inbox__info--expertise">
            <span class="iconify inbox__info--expertise-icon" data-icon="fa-solid:paint-brush" /> {{ user.expertise }}
          </p>
          <p v-else class="inbox__info--expertise">
            {{ user.expertise }}
          </p>

          <p v-if="user.role === 'Student'" class="inbox__info--available">
            <span class="iconify inbox__info--expertise-icon" data-icon="carbon:dot-mark" />
            Available
          </p>

          <p v-else-if="user.role === 'Lecturer'" class="inbox__info--verified">
            <span class="iconify" data-icon="bi:shield-fill-check" width="15" height="15" />
            Verified
          </p>
        </div>
      </div>

      <div class="inbox__right--container">
        <div class="explore__main--container mb-0">
          <div class="inbox--top-left">
            <span class="iconify inbox--left-icon" data-icon="ion:mail-unread-sharp" />
            <h2 class="inbox--heading">
              Inbox
            </h2>
          </div>
          <button class="btn--clear flex-center" @click="toggleFilter">
            <div class="icon">
              <span class="iconify" data-icon="ic:round-filter-list" height="24" width="24" />
              <span v-if="$matchMedia.xl">Filters</span>
            </div>
          </button>
        </div>

        <div v-show="showFilter && $matchMedia.xl" class="explore--filter mb-1_5 ">
          <div class="flex-row space-between">
            <div class="select select--small select--border ml-auto">
              <select v-model="selected">
                <option disabled value="">
                  Category:
                </option>
                <option v-for="category in filters" :key="`SelectInbox-${category.name}`">
                  {{ category.name }}
                </option>
              </select>
              <span class="focus" />
            </div>
          </div>
        </div>

        <div class="inbox--container">
          <InboxItem v-for="inbox in inboxes" :key="`inbox-${inbox.id}`" :data="inbox" />
          <p v-if="inboxes.length === 0" class="info__p">
            There isn't any Inbox yet
          </p>
        </div>
      </div>
    </div>

    <Modal v-if="!$matchMedia.xl" ref="filtersModal" :type="`small`">
      <template v-slot:header>
        <h4 class="post__modal--h4 my-0">
          Filters
        </h4>
      </template>

      <template v-slot:body>
        <div class="separator-short my-0 mb-2_5" />
        <div class="select select--small select--border ml-auto">
          <select v-model="selected">
            <option disabled value="">
              Category:
            </option>
            <option v-for="category in filters" :key="`SelectInbox-${category.name}`">
              {{ category.name }}
            </option>
          </select>
          <span class="focus" />
        </div>
      </template>

      <template v-slot:footer>
        <button class="btn btn--clear mx-auto" @click="clearFilter">
          Clear Filter
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import InboxItem from '~/components/InboxItem.vue'

export default {
  name: 'InboxPage',
  middleware: ['auth'],
  components: { InboxItem },

  metaInfo () { return { title: 'Inbox' } },

  data: () => {
    return {
      showFilter: false,
      selected: ''
    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
      data: 'notification/inbox'
    }),

    filters () {
      if (this.user.role === 'Student') {
        return [
          { name: 'Message', count: 0 },
          { name: 'Team Invitation', count: 0 },
          { name: 'Project Invitation', count: 0 }
        ]
      }

      return [
        { name: 'Message', count: 0 }
      ]
    },

    inboxes () {
      if (this.selected !== '') {
        return this.data.filter(inbox => inbox.category === this.selected)
      }

      return this.data
    }
  },

  mounted () {
    this.getInbox()

    this.$nextTick(function () {
      setTimeout(() => {
        if (this.user.new_notifications_count > 0) {
          document.querySelector('[d^="M374"]').style.color = 'unset'
          this.$store.dispatch('auth/updateNotifications', 0)
        }
      }, 400)
    })
  },

  methods: {
    async getInbox () {
      this.$store.dispatch('notification/fetchInbox')
    },

    toggleFilter () {
      this.showFilter = !this.showFilter
      if (!this.$matchMedia.xl) this.$refs.filtersModal.openModal()
    },

    clearFilter () {
      this.selected = ''
    }
  }
}
</script>
