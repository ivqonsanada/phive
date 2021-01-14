<template>
  <div class="shortlist-item__container">
    <div class="shortlist-item__left-container">
      <div class="">
        <img class="shortlist-avatar" :src="data.avatar" alt="">
      </div>
      <div class="shortlist-item__body">
        <div class="shortlist-item__body-top">
          <div class="shortlist-item__name">
            {{ data.full_name }}
          </div>
          <div class="shortlist-item__expertise">
            {{ data.expertise }}
          </div>
        </div>
        <div class="project-box__details--container" @click="showDetails">
          <span class="shortlist-item__details">Details</span>
        </div>
      </div>
    </div>

    <button :class="btn.class" @click="accept">
      {{ btn.text }}
    </button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ShortlistItemIndividual',

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null },
    index: { type: Number, default: null }
  },

  data: () => ({

  }),

  computed: {
    ...mapGetters({
      // snackbar: 'notification/snackbar'
    }),

    btn () {
      if (this.data.isAccepted) {
        return { text: 'Accepted', class: 'btn--accepted' }
      } else {
        return { text: 'Accept', class: 'btn--accept' }
      }
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

    async accept () {
      this.data.isAccepted = !this.data.isAccepted

      this.$emit('accept', {
        index: this.index,
        isAccepted: this.data.isAccepted
      })
    }
  }
}
</script>

<style scoped>

</style>
