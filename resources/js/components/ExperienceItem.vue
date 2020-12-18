<template>
  <div class="experience-item">
    <div class="flex-row">
      <div class="experience__image--container">
        <img src="https://via.placeholder.com/50" width="50" height="50" alt="">
      </div>
      <div class="experience__desc ml-1">
        <div>
          <div class="experience__heading">
            {{ data.project_name }}
          </div>
          <div class="experience__job">
            {{ data.project_role }}
          </div>
        </div>
        <div class="experience__date">
          {{ startDate }} - {{ endDate }}
        </div>
      </div>
    </div>

    <button v-if="deletable" class="btn btn--decline experience-item__delete" @click="deleteExperience">
      <Icon :icon="'whh:delete'" />
      <span>Delete</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ExperienceItem',

  props: {
    data: { type: Object, default: null },
    deletable: { type: Boolean, default: false },
    index: { type: Number, default: null }
  },

  computed: {
    startDate () {
      const date = new Date(this.data.start_date)
      let options = { year: 'numeric', month: 'long' }
      return date.toLocaleString('en-US', options)
    },

    endDate () {
      const date = new Date(this.data.end_date)
      let options = { year: 'numeric', month: 'long' }
      return date.toLocaleString('en-US', options)
    }
  },

  methods: {
    deleteExperience () {
      this.$emit('click', this.index)
    }
  }
}
</script>
