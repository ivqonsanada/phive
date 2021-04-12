<template>
  <div class="inbox__right--container">
    <div class="inbox--top">
      <div class="inbox--top-left">
        <span class="iconify inbox--left-icon" data-icon="carbon:3rd-party-connected" />
        <h2 class="inbox--heading">
          Party
        </h2>
      </div>
    </div>
    <div class="inbox--container">
      <div v-if="party && party.member.length !== 0">
        <PartyItem v-for="party in party.member" :key="`PartyItem-${party.id}`" :data="party" />
      </div>
      <p v-else class="info__p">
        Hope you get party soon :)
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PartyItem from '~/components/Party/PartyItem'

export default {
  name: 'PartyAsMemberPage',
  scrollToTop: false,

  components: { PartyItem },

  metaInfo () { return { title: 'Party as Member' } },

  computed: {
    ...mapGetters({
      party: 'auth/party'
    })
  }
}
</script>
