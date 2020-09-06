<template>
  <div class="wide-layout">
    <child />
  </div>
</template>

<script>

export default {
  name: 'WideLayout'
}
</script>

<style scoped>
.wide-layout {
  height: 100vh;
  min-height: fit-content;

  /* max-width: 1366px;
  margin: 0 auto;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.1); */

}
</style>
