<template>
  <div :class="color">
    {{ name }}
  </div>
</template>

<script>
export default {
  name: 'BubbleSkill',

  props: {
    name: { type: String, default: null },
    color: { type: String, default: null }
  }
}
</script>
