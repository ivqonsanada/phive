<template>
  <div class="member-item_container">
    <div class="member-item__left-container">
      <router-link :to="{ path: '/@/' + data.member.tagname }" class="my-auto">
        <img class="member-item__avatar" :src="data.member.avatar" alt="">
      </router-link>
      <div class="shortlist-item__body flex-center-column">
        <!-- <div> -->
        <div class="shortlist-item__name">
          {{ data.member.full_name }}
        </div>
        <div class="shortlist-item__expertise">
          {{ data.expertise }}
        </div>
        <!-- </div> -->
      </div>
    </div>

    <button class="btn--cancel" @click="kick">
      Kick
    </button>
  </div>
</template>

<script>
export default {
  name: 'PartyMemberItem',

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null },
    index: { type: Number, default: null }
  },

  methods: {
    kick () {
      // console.log('Kick')
      this.$emit('click', this.index)
    }
  }
}
</script>
