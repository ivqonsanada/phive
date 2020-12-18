<template>
  <span class="iconify" :data-icon="icon" :class="classes" :width="width" :height="height" />
</template>

<script>
export default {
  name: 'Icon',

  props: {
    icon: { type: String, default: null },
    classes: { type: String, default: '' },
    width: { type: Number, default: null },
    height: { type: Number, default: null }
  }
}
</script>
