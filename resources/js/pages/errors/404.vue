<template>
  <div class="notfound__container">
    <TopImage v-if="!$matchMedia.xl" :type="1" />

    <div class="flex-center-column text-center mb-2 notfound__body">
      <img class="notfound__img" src="/images/404.svg" width="214" height="214" alt="">
      <h2 class="notfound__h2">
        Page Not Found
      </h2>
      <p class="newcomer__p mt-3">
        You are likely visiting a wrong address or the page has been removed.
      </p>
    </div>

    <router-link :to="{ name: 'explore' }" class="btn btn--blue btn--large mt-auto mx-auto" tag="button">
      Let's Explore
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',

  metaInfo () { return { title: 'Page Not Found' } }
}
</script>
