<template>
  <div :class="chatStyle">
    <template v-if="user !== data.sender_id">
      <img :src="data.sender.avatar" alt="" class="message-item--img">
      <div class="ml-1 message-item__body--container">
        <div v-if="!$matchMedia.xl" class="message-item__body--name">
          {{ data.sender.full_name }}
        </div>
        <div class="message-bubble__container message-bubble__container--other mt-1">
          <Mark class="mark">{{ data.message }}</Mark>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="message-bubble__container message-bubble__container--self">
        <Mark class="mark">{{ data.message }}</Mark>
      </div>
    </template>
  </div>
</template>

<script>
import Mark from '@swayable/vue-snarkdown'

export default {
  name: 'MessageItem',

  components: {
    Mark
  },

  props: {
    data: { type: Object, default: null },
    user: { type: Number, default: null }
  },

  computed: {
    chatStyle () {
      return this.user !== this.data.sender_id ? 'message-item__container--other' : 'message-item__container--self'
    }
  }
}
</script>

<style scoped>

</style>
