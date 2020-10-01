<template>
  <div>
    <div class="apply__top--container">
      <div class="edit-profile__top-decore">
        <div class="edit-profile__inside-top-decore" />
      </div>
    </div>
    <h2 class="mb-1_5">
      Page Not Found
    </h2>

    <router-link :to="{ name: 'explore' }" class="btn btn--red mb-1_5" tag="button">
      Let's Explore
    </router-link>

    <router-link :to="{ name: 'index' }" class="btn btn--grey">
      Back to Home
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>
