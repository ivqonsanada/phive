<template>
  <transition name="fade">
    <div v-if="show" class="modal">
      <div class="modal__backdrop" @click="closeModal()" />

      <div class="modal__dialog" :class="modalClass">
        <div class="modal__header">
          <slot name="header" />
          <button type="button" class="modal__close btn--clear" @click="closeModal()">
            <span class="iconify" data-icon="maki:cross-11" width="20" height="20" />
          </button>
        </div>

        <div class="modal__body">
          <slot name="body" />
        </div>

        <div v-if="footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    footer: { type: Boolean, default: true },
    type: { type: String, default: 'default' }
  },
  data () {
    return {
      show: false
    }
  },
  computed: {
    modalClass () {
      if (this.type === 'small') return 'modal__dialog--small'
      if (this.type === 'medium') return 'modal__dialog--medium'
      return ''
    }
  },
  beforeDestroy () {
    this.closeModal()
  },
  methods: {
    closeModal () {
      this.show = false
      document.querySelector('html').classList.remove('overflow-hidden')
    },
    openModal () {
      this.show = true
      document.querySelector('html').classList.add('overflow-hidden')
    }
  }
}
</script>

<style lang="scss" scoped>
@import './resources/sass/abstract/_mixins.scss';

.modal {
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;
  &__backdrop {
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
  }
  &__dialog {
    background-color: #ffffff;
    position: relative;
    width: 90%;
    margin: 5rem auto;
    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    z-index: 2;

    @include respon(xl) {
      max-width: 108rem
    }

          &--small {
         max-width: 48rem
      }
      &--medium {
         max-width: 72rem
      }
  }
  &__close {
    position: relative;
    bottom: 1.5rem;
    width: 3rem;
    height: 3rem;
    color: #9D9D9D;
  }
  &__header {
    padding: 3.4rem 2rem 1rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  &__body {
    padding: 1rem 2rem 1rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  &__footer {
    padding: 1rem 2rem 2.6rem;
    display: flex;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
