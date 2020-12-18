<template>
  <div ref="messageScroll" class="message--container">
    <div v-if="$matchMedia.xl" class="flex-row space-between">
      <div class="flex-row">
        <button class="btn--clear flex mr-1_5" @click="back">
          <span class="iconify message-icon" data-icon="eva:arrow-back-fill" />
        </button>
        <h2 class="message__h1">
          {{ otherUser.full_name }}
        </h2>
      </div>
      <button class="btn--clear flex" @click="showInfo">
        <span class="iconify message-icon" data-icon="eva-info-outline" />
      </button>
    </div>
    <div>
      <div ref="messageList" class="message-item__list">
        <MessageItem v-for="message in messages.message_bodies" :key="`message-${message.id}`" :data="message" :user="user.id" />
      </div>

      <div class="chat-input__container">
        <textarea ref="textAreaChat" type="text" class="chat-input" placeholder="Type your message here" @input="autoResizeTextarea" @keyup.alt.enter="send" />
        <div class="ml-1 align-self-end flex-row">
          <button class="btn--clear flex" @click="send">
            <span class="iconify message-icon" data-icon="carbon:send-filled" />
          </button>
        </div>
      </div>
    </div>

    <modal v-if="$matchMedia.xl" ref="showMessageInfo" :type="`small`" class="message__info">
      <template v-slot:header>
        <!-- <div class="shortlist-modal__stabilizier" /> -->
        <h4 class="post__modal--h4 my-0">
          How to Chat
        </h4>
      </template>

      <template v-slot:body>
        <div class="separator-short mb-1_5" />
        <div class="message__info--body-container">
          <p class="mb-2">
            Chat System is based on Markdown.
          </p>
          <div class="flex-row">
            <p>Enter (new line), do enter 2 times:</p>
            <div class="message__info--pre">
              <span class="iconify message__info--instruction-icon" data-icon="uil:enter" />
              <span class="iconify message__info--instruction-icon" data-icon="uil:enter" />
            </div>
          </div>
          <div class="flex-row">
            <p><i>Italic</i>: </p>
            <div class="message__info--pre">
              *text* or _text_
            </div>
          </div>
          <div class="flex-row">
            <p> <b>Bold</b>: </p>
            <div class="message__info--pre">
              **text**
            </div>
          </div>
          <div class="flex-row">
            <p> <b><i>Italic Bold</i></b>: </p>
            <div class="message__info--pre">
              ***text***
            </div>
          </div>

          <div class="mt-2">
            <div class="flex-row">
              <p>Send Chat: </p>
              <div class="message__info--pre">
                <p>
                  Alt +
                  <span class="iconify message__info--instruction-icon" data-icon="uil:enter" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import MessageItem from '~/components/MessageItem.vue'
import snarkdown from 'snarkdown'

export default {
  name: 'MessagePage',
  layout: 'backInfo',
  middleware: ['auth'],
  components: { MessageItem },

  metaInfo () { return { title: 'Message' } },

  data: () => ({
    otherUser: {},
    messages: [],
    interval: '',
    firstLoad: false
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  },

  mounted () {
    this.getMessage()

    this.interval = setInterval(this.getMessage, 20000)
  },

  beforeDestroy  () {
    clearInterval(this.interval)
  },

  methods: {
    async getMessage () {
      await axios.post(`/api/user/${this.$route.params.tagname}/message`)
        .then(({ data }) => {
          this.$store.dispatch('navigation/changeTitle', {
            title: data.user.full_name
          })
          this.messages = data.messages
          this.otherUser = data.user
        })
        .then(e => {
          if (!this.firstLoad) {
            this.$refs.messageScroll.scrollTop = this.$refs.messageScroll.scrollHeight
            this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight
            this.firstLoad = true
          }
        })
    },

    async send () {
      if (this.$refs.textAreaChat.value.length < 1) return false

      axios.post(`/api/user/${this.$route.params.tagname}/message/send`, {
        message: snarkdown(this.$refs.textAreaChat.value)
      })
        .then(({ data }) => {
          this.$refs.textAreaChat.value = ''

          let heightPerLine = '3.2rem'
          if (this.$matchMedia.xl) heightPerLine = '4.6rem'
          this.$refs.textAreaChat.style.height = heightPerLine
          // this.$refs.messageList.style.marginBottom = `3.2rem`

          this.messages = data.messages
        })
        .then(e => {
          this.$refs.messageScroll.scrollTop = this.$refs.messageScroll.scrollHeight
          this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight
        })
    },

    async autoResizeTextarea (event) {
      if (event.target.value.length < 1) {
        let heightPerLine = '3.2rem'
        if (this.$matchMedia.xl) heightPerLine = '4.6rem'
        event.target.style.height = heightPerLine
        if (!this.$matchMedia.xl) this.$refs.messageList.style.marginBottom = '6.2rem'
      } else {
        event.target.style.height = 'auto'
        if (event.target.scrollHeight >= 136) event.target.style.height = '13.6rem'
        else event.target.style.height = `${event.target.scrollHeight / 10}rem`

        if (!this.$matchMedia.xl) {
          if (event.target.scrollHeight >= 136) this.$refs.messageList.style.marginBottom = '16.6rem'
          else this.$refs.messageList.style.marginBottom = `${(event.target.scrollHeight / 10) + 3}rem`
        }

        this.$refs.messageScroll.scrollTop = this.$refs.messageScroll.scrollHeight
        this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight
      }
    },

    showInfo () {
      this.$refs.showMessageInfo.openModal()
    },

    back () {
      this.$router.back()
    }

  }
}
</script>
