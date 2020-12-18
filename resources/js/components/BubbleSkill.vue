<template>
  <div class="bubble-wrap" :class="color">
    <span>{{ name }}</span>
    <div v-if="deletable" class="pointer bubble__button--delete" @click="deleteSkill">
      <span class="iconify bubble-icon" data-icon="gg:close"  />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BubbleSkill',

  props: {
    name: { type: String, default: null },
    color: { type: String, default: null },
    deletable: { type: Boolean, default: false }
  },

  methods: {
    deleteSkill () {
      this.$emit('click', this.name)
    }
  }
}
</script>
