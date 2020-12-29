<template>
  <div class="participant-review__container">
    <div class="participant-review__top">
      <div class="participant-review__top-container">
        <div class="participant-review__top-left-container">
          <img :src="data.member.avatar" class="participant-review__img" alt="">
          <div class="participant-review__info">
            <p><b>Member</b></p>
            <p>{{ data.member.full_name }}</p>
            <p>{{ data.expertise }}</p>
          </div>
        </div>

        <div class="text-center">
          <p class="participant-review__score-text">
            Student Score
          </p>
          <p class="participant-review__score-number">
            {{ Number(data.score).toFixed(1) }}
          </p>
        </div>
      </div>
    </div>

    <div class="participant-review__bottom" :class="{ 'participant-review__bottom--open': show, 'participant-review__bottom--close': close }">
      <p>{{ data.assessment }}</p>
      <p class="text-bold">
        {{ lecturer }}
      </p>
    </div>

    <!-- <div> -->
    <div class="btn--clear participant-review__button" :class="{ 'participant-review__button--active': show }" @click="toggleButton">
      <span class="iconify participant-review__button--icon" data-icon="bi:arrow-right-short" />
    </div>
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  name: 'ParticipantReview',

  props: {
    data: { type: Object, default: null },
    lecturer: { type: String, default: null },
    index: { type: Number, default: null }
  },

  data: () => ({
    show: false,
    close: true
  }),

  methods: {
    toggleButton () {
      if (!this.show) {
        this.show = true
        this.close = false
      } else {
        this.show = false
        this.close = true
      }
    }
  }
}
</script>
