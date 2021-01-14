<template>
  <div class="main-layout">
    <div v-if="!$matchMedia.xl" class="nav">
      <div class="nav-base">
        <div class="flex-row">
          <button class="nav-toggler btn--clear flex" @click="back">
            <span class="iconify" data-icon="eva:arrow-back-fill" width="24" height="24" />
          </button>

          <div class="nav--brand-container ml-1">
            <a class="nav-brand">
              <div v-show="title">
                {{ title }}
              </div>
              <div v-show="!title">
                <img src="/images/logo-blue.svg" alt="">
              </div>
            </a>
          </div>
        </div>

        <button class="btn--clear flex" @click="showInfo">
          <span class="iconify" data-icon="eva-info-outline" height="30" width="30" />
        </button>

        <modal ref="showMessageInfo">
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
            </div>
          </template>
        </modal>
      </div>
    </div>
    <Navbar v-else />

    <div class="container">
      <Child />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '~/components/Navbar'
// import Footer from '~/components/Footer'

export default {
  name: 'BackInfoLayout',

  components: {
    Navbar
    // Footer
  },

  computed: {
    ...mapGetters({
      title: 'navigation/title'
    })
  },

  methods: {
    back () {
      this.$router.back()
    },

    showInfo () {
      this.$refs.showMessageInfo.openModal()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './resources/sass/abstract/_mixins.scss';

.container {
  display: flex;
  height: 100vh;
  // flex-direction: column-reverse;
  padding: calc(var(--mobile-nav-height) + 0.5rem) 3rem 3rem;

  @include respon(xl) {
    min-height: 100vh;
     height: unset;
    padding-top: calc(var(--desktop-nav-height) + 0.5rem);
  }
}

.main-layout {
  min-height: 100vh;
  background: #FFFFFF;
}
</style>
