<template>
  <div>
    <div class="project-box__top-container">
      <div class="">
        <router-link :to="{ name: '@.info', params: { tagname: data.message_body.sender.tagname } }">
          <img class="project-box__img" :src="data.message_body.sender.avatar" alt="">
        </router-link>
      </div>
      <div class="project-box__content--container">
        <router-link v-if="!$matchMedia.xl" :to="{ name: 'message', params: { tagname: data.message_body.sender.tagname } }" class="link--clean">
          <p class="project-box__content project-box__name ellipsies">
            {{ data.message_body.sender.full_name }}
          </p>
          <p class="project-box__message">
            <VueSnarkdown>{{ message }}</VueSnarkdown>
          </p>
        </router-link>
        <div v-else>
          <p class="project-box__content project-box__name ellipsies">
            {{ data.message_body.sender.full_name }}
          </p>
          <p class="project-box__message">
            <VueSnarkdown>{{ message }}</VueSnarkdown>
          </p>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <router-link :to="{ name: 'message', params: { tagname: data.message_body.sender.tagname } }" class="btn btn--blue" tag="button">
          See Chat
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import VueSnarkdown from '@swayable/vue-snarkdown'

export default {
  name: 'IndexItemMessage',

  components: { VueSnarkdown },

  props: {
    data: { type: Object, default: null }
  },

  computed: {
    message () {
      const containImage = !!this.data.message_body.message.includes('img')
      if (containImage) return 'Sent an image'
      return this.data.message_body.message
    }
  }

}
</script>
