<template>
  <transition name="fade">
    <div v-if="show" class="modal">
      <div class="modal__backdrop" @click="closeModal()" />

      <div class="modal__dialog">
        <div class="modal__header">
          <slot name="header" />
          <button type="button" class="modal__close btn--clear" @click="closeModal()">
            <span class="iconify" data-icon="maki:cross-11" data-inline="false" width="20" height="20" />
          </button>
        </div>

        <div class="modal__body">
          <slot name="body" />
        </div>

        <div class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Modal',
  data () {
    return {
      show: false
    }
  },
  methods: {
    closeModal () {
      this.show = false
    },
    openModal () {
      this.show = true
    }
  }
}
</script>

<style lang="scss" scoped>
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
    width: 600px;
    margin: 50px auto;
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    z-index: 2;
    @media screen and (max-width: 992px) {
      width: 90%;
    }
  }
  &__close {
    position: relative;
    bottom: 10px;
    width: 30px;
    height: 30px;
    color: #9D9D9D;
  }
  &__header {
    padding: 34px 20px 10px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }
  &__body {
    padding: 10px 20px 10px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  &__footer {
    padding: 10px 20px 26px;
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
