<template>
  <div class="shortlist-item__container">
    <template v-if="data.member && !isIndividual && isResponded">
      <div class="shortlist-item__left-container">
        <div class="flex-center-column">
          <router-link :to="{ path: '/@/' + data.member.tagname }">
            <img class="candidates__avatar" :src="data.member.avatar" alt="">
          </router-link>
        </div>
        <div class="shortlist-item__body flex-center-column">
          <div class="candidates__name mb-1">
            {{ index === 0 ? 'Leader' : 'Member' }}
          </div>
          <div>
            <div class="candidates__name">
              {{ data.member.full_name }}
            </div>
            <div class="candidates__expertise">
              {{ data.expertise }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="data.member && !isIndividual">
      <div class="shortlist-item__left-container">
        <div class="flex-center-column">
          <router-link :to="{ path: '/@/' + data.member.tagname }">
            <img class="candidates__avatar" :src="data.member.avatar" alt="">
          </router-link>
        </div>
        <div class="shortlist-item__body flex-center-column">
          <div class="candidates__name mb-1">
            {{ index === 0 ? 'Leader' : 'Member' }}
          </div>
          <div>
            <div class="candidates__name">
              {{ data.member.full_name }}
            </div>
            <div class="candidates__expertise">
              {{ data.expertise }}
            </div>
          </div>
        </div>
      </div>
      <button v-if="index === 0" class="btn--cancel" @click="cancel">
        Cancel
      </button>
    </template>

    <template v-else-if="data.status === 'Waiting'">
      <div class="shortlist-item__left-container">
        <div class="flex-center-column">
          <router-link :to="{ path: '/@/' + data.from.tagname }">
            <img class="candidates__waiting--avatar" :src="data.from.avatar " alt="">
          </router-link>
        </div>
        <div class="shortlist-item__body flex-center-column">
          <div>
            <div class="shortlist-item__name">
              {{ data.from.full_name }}
            </div>
            <div class="shortlist-item__expertise">
              {{ data.expertise }}
            </div>
          </div>
        </div>
      </div>
      <button class="btn--cancel" @click="cancel">
        Cancel
      </button>
    </template>
    <template v-else-if="data.status === 'Fixed'">
      <div class="shortlist-item__left-container">
        <div class="flex-center-column">
          <router-link :to="{ path: '/@/' + data.from.tagname }">
            <img class="candidates__avatar" :src="data.from.avatar" alt="">
          </router-link>
        </div>
        <div class="shortlist-item__body flex-center-column">
          <div>
            <div class="candidates__name">
              {{ data.from.full_name }}
            </div>
            <div class="candidates__expertise">
              {{ data.expertise }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="data.status === 'Bail Out'">
      <div class="shortlist-item__left-container">
        <div class="flex-center-column">
          <router-link :to="{ path: '/@/' + data.from.tagname }">
            <img class="candidates__avatar" :src="data.from.avatar" alt="">
          </router-link>
        </div>
        <div class="shortlist-item__body flex-center-column">
          <div>
            <div class="candidates__name">
              {{ data.from.full_name }}
            </div>
            <div class="candidates__expertise">
              {{ data.expertise }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CandidateItem',

  props: {
    data: { type: Object, default: null },
    index: { type: Number, default: null },
    isIndividual: { type: Boolean, default: true },
    isResponded: { type: Boolean, default: false }
  },

  data: () => ({

  }),

  computed: {
    ...mapGetters({
      // snackbar: 'notification/snackbar'
    }),

    btn () {
      return { text: 'Cancel', class: 'btn--decline' }
    }
  },

  methods: {
    async showDetails () {
      // this.$refs.showApplicantDetails.openModal()
      this.data.index = this.index
      this.$emit('click', this.data)
    },

    async hideDetails () {
      this.$refs.showApplicantDetails.closeModal()
    },

    async cancel () {
      this.$emit('cancel', { type: this.isIndividual ? 'Individual' : 'Team', index: this.index })
    }
  }
}
</script>

<style scoped>

</style>
