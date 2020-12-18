<template>
  <li>{{ data.requirement }}</li>
</template>

<script>
export default {
  name: 'RequirementItem',

  props: {
    data: { type: Object, default: null }
  }
}
</script>
