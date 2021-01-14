<template>
  <div class="newcomer__slide-3--container">
    <div>
      <h2 class="newcomer__slide-3--heading">
        Get Ready to Dive in with Project Hive!
      </h2>
      <p class="newcomer__slide-3--text mb-3">
        Climb to the top and find the exciting experience through out the process
      </p>

      <router-link :to="{ name: 'explore' }" class="btn btn--blue btn--large mx-auto" tag="button">
        Dive In
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewcomerPage3',

  metaInfo () { return { title: 'Newcomer - 3' } }
}
</script>
