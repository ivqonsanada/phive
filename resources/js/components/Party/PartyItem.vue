<template>
  <div class="party-item__container">
    <div class="party-item__left-container">
      <img v-for="e in data.members" :key="`PartyMemberAvatar-${e.id}`" class="party-item__avatar" :src="e.member.avatar" alt="">
    </div>

    <div>
      <button class="btn--details" @click="details">
        Details
      </button>

      <modal ref="partyMemberList">
        <template v-slot:header>
          <!-- <div class="shortlist-modal__stabilizier" /> -->
          <h4 class="post__modal--h4 my-0">
            Details
          </h4>
        </template>

        <template v-slot:body>
          <div class="separator-short mb-2_5" />
          <div class="party-members__container">
            <PartyMember v-for="(member, i) in data.members" :key="`PartyMember-${i}`" :data="member" />
          </div>
        </template>

        <template v-slot:footer>
        <!-- <button class="btn btn--blue ml-auto" :disabled="disableShortlist" @click="showShortlist">
          Shortlist Student
        </button> -->
        </template>
      </modal>
    </div>
  </div>
</template>

<script>
import PartyMember from '~/components/Party/PartyMember.vue'

export default {
  name: 'PartyMemberItem',

  components: {
    PartyMember
  },

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null },
    index: { type: Number, default: null }
  },

  methods: {
    details () {
      this.$refs.partyMemberList.openModal()
      // this.$emit('click', this.index)
    }
  }
}
</script>
