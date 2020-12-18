<template>
  <div>
    <template v-if="user.id !== data.sender_id">
      <div class="message-item__container--other">
        <img :src="data.sender.avatar" alt="" class="message-item--img">
        <div class="ml-1">
          <div>{{ data.sender.first_name + ' ' + data.sender.last_name }}</div>
          <div class="message-bubble__container--other mt-1">
            <Mark class="mark">{{ data.message }}</Mark>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="message-item__container--self">
        <div class="message-bubble__container--self">
          <Mark class="mark">{{ data.message }}</Mark>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Mark from '@swayable/vue-snarkdown'

export default {
  name: 'MessageItem',

  components: {
    Mark
  },

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

<style scoped>

</style>
