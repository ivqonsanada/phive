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

<style scoped>
  .blue {
    font-size: 12px;
    font-weight: 700;
    line-height: 1.65;
    padding: 5px 15px;
    border-radius: 10px;
    color: #ffffff;
    background-color: #00214D;
    letter-spacing: 0.02em;
  }

  .red {
    font-size: 12px;
    font-weight: 600;
    line-height: 1.65;
    padding: 5px 15px;
    border-radius: 10px;
    color: #001534;
    background-color: #FF5470;
  }
</style>
