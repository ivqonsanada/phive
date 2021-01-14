<template>
  <li class="edit-profile__requirement-item">
    <div class="flex-start">
      <Icon :icon="'bi-dot'" :width="24" :height="24" />
      <span>{{ data.requirement }}</span>
    </div>
    <div v-if="deletable" class="ml-1 flex-center pointer" @click="deleteRequirement">
      <Icon :icon="'mdi:close-thick'" :width="19" :height="19" />
    </div>
  </li>
</template>

<script>
export default {
  name: 'RequirementItem',

  props: {
    data: { type: Object, default: null },
    deletable: { type: Boolean, default: false },
    index: { type: Number, default: null }
  },

  methods: {
    deleteRequirement () {
      this.$emit('click', this.index)
    }
  }
}
</script>
