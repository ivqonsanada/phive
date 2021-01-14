<template>
  <div class="top-img__container">
    <div class="top-img__background" :class="`top-img__type--${type}`">
      <div class="top-img__logo" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopImage',

  props: {
    type: { type: Number, default: 1 }
  }
}
</script>
