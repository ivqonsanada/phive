<template>
  <div ref="messageScroll" class="message--container">
    <div class="message-item__list">
      <div v-for="message in messages.message_bodies" :key="`message-${message.id}`" class="mb-1_5">
        <MessageItem :data="message" />
      </div>
    </div>

    <div class="chat-input__container">
      <textarea ref="textAreaChat" type="text" class="chat-input" placeholder="Type your message here" @input="autoResizeTextarea" />
      <button class="btn--clear ml-1 align-self-end" @click="send">
        <span class="iconify" data-icon="carbon:send-filled" data-inline="true" height="30" width="30" />
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import MessageItem from '~/components/MessageItem.vue'
import snarkdown from 'snarkdown'

export default {
  layout: 'back',

  middleware: 'auth',

  components: {
    MessageItem
  },

  metaInfo () {
    return { title: 'Home' }
  },

  data: () => ({
    messages: [],
    interval: ''
  }),

  computed: {
    ...mapGetters({
      user_one: 'auth/user'
    })
  },

  mounted () {
    this.getMessage()

    this.interval = setInterval(this.getMessage, 20000)
    // window.Echo.channel('newTask').listen('.task-created', e => {
    //   this.$store.commit('ADD_TODO', e.task)
    //   this.newTodo.title = ''
    // })
    // window.Echo.channel('taskRemoved').listen('.task-removed', e => {
    //   this.$store.commit('DELETE_TODO', this.toRemove)
    // })
  },

  beforeDestroy  () {
    clearInterval(this.interval)
  },

  methods: {
    async getMessage () {
      await axios.post(`/api/user/${this.$route.params.tagname}/message`)
        .then(({ data }) => {
          this.$store.dispatch('navigation/changeTitle', {
            title: data.user.first_name + ' ' + data.user.last_name
          })
          this.messages = data.messages
        })
        .then(e => {
          this.$refs.messageScroll.scrollTop = this.$refs.messageScroll.scrollHeight
        })
    },

    async send () {
      if (this.$refs.textAreaChat.value.length < 1) return false

      axios.post(`/api/user/${this.$route.params.tagname}/message/send`, {
        message: snarkdown(this.$refs.textAreaChat.value)
      })
        .then(({ data }) => {
          this.$refs.textAreaChat.value = ''
          this.$refs.textAreaChat.style.height = `32px`

          this.messages = data.messages
        })
        .then(e => {
          this.$refs.messageScroll.scrollTop = this.$refs.messageScroll.scrollHeight
        })
    },

    async autoResizeTextarea (event) {
      if (event.target.value.length < 1) event.target.style.height = `32px`
      else {
        event.target.style.height = 'auto'
        event.target.style.height = `${event.target.scrollHeight}px`
      }
    }
  }
}
</script>
