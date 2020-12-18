<template>
  <ul class="post__requirements">
    <RequirementItem v-for="(requirement, index) in data" :key="`requirements-${index}`" :data="requirement" />
  </ul>
</template>

<script>
import RequirementItem from '~/components/RequirementItem'

export default {
  name: 'RequirementList',

  components: {
    RequirementItem
  },

  props: {
    data: { type: Array, default: null }
  }
}
</script>
