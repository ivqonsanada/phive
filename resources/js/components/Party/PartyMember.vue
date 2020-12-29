<template>
  <div class="party-member__left-container">
    <div class="flex-center-column">
      <router-link :to="{ path: '/@/' + data.member.tagname }">
        <img class="party-member__avatar" :src="data.member.avatar" alt="">
      </router-link>
    </div>
    <div class="shortlist-item__body flex-center-column">
      <div class="party-member__info">
        <div class="candidates__name">
          {{ data.member.full_name }}
        </div>
        <div class="candidates__expertise">
          {{ data.expertise }}
        </div>
      </div>
    </div>
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
