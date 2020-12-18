<template>
  <div class="backwards">
    <div class="slide-1__container">
      <div class="slide-1__first-block">
        <h2 class="slide-1__heading">
          Expand <br>
          Your Career <br>
          by Doing <br>
          Project.
        </h2>
        <div class="slide-1__ornament">
          <img class="slide-1__triangle" src="/images/triangle.svg" alt="">
          <img class="slide-1__left-dashed" src="/images/left-dashed.svg" alt="">
          <img class="slide-1__right-dashed" src="/images/right-dashed.svg" alt="">
        </div>
        <p class="slide-1__paragraph">
          Fill up your college life with expectation
        </p>
        <router-link :to="{ name: 'explore' }" class="slide-1__button" tag="button">
          <span>Get Started</span>
          <span class="iconify" data-icon="ion:arrow-forward-outline" data-inline="true" />
        </router-link>
      </div>
      <div class="slide-1__image-container">
        <img class="slide-1__dot-1" src="/images/dot-red.svg" alt="">
        <img class="slide-1__dot-2" src="/images/dot-blue.svg" alt="">
        <img class="slide-1__image" src="/images/smiling-woman-looking.png" alt="">
      </div>
    </div>
    <div class="slide-2__container">
      <h2 class="slide-2__heading">
        See The <br>
        Available <br>
        Project on <br>
        The Platform
      </h2>
      <p class="slide-2__paragraph">
        Knowing the available project that currently posted on the website and the finished project will determine your spirit!
      </p>
      <div class="slide-2__facts">
        <div class="slide-2__fact-item">
          <span class="iconify slide-2__fact--icon" data-icon="bx:bxs-brain" data-inline="false" />
          <div class="slide-2__fact--number">
            39
          </div>
          <div class="slide-2__fact--name">
            Active Projects
          </div>
        </div>
        <div class="slide-2__fact-item">
          <span class="iconify slide-2__fact--icon" data-icon="entypo:paper-plane" data-inline="false" />
          <div class="slide-2__fact--number">
            20
          </div>
          <div class="slide-2__fact--name">
            Ongoing Projects
          </div>
        </div>
        <div class="slide-2__fact-item">
          <span class="iconify slide-2__fact--icon" data-icon="ant-design:check-circle-outlined" data-inline="false" />
          <div class="slide-2__fact--number">
            112
          </div>
          <div class="slide-2__fact--name">
            Finished Projects
          </div>
        </div>
      </div>
    </div>
    <div class="slide-3__container">
      <h2 class="slide-3__heading">
        Leaderboard
      </h2>
      <p class="slide-3__paragraph">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus quis id eu ipsum at.
      </p>
      <div class="slide-3__leaderboard--card">
        <img src="https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm" alt="" class="slide-3__leaderboard--img">
        <div class="slide-3__leaderboard--name">
          {{ user ? user.name : 'Carlos Abravetta' }}, UI/UX Designer
        </div>

        <div class="slide-3__leaderboard--hr" />
        <div class="slide-3__leaderboard--facts">
          <div class="slide-3__leaderboard--fact-item">
            <span class="iconify slide-3__leaderboard--fact-icon" data-icon="ic:round-check-circle" data-inline="false" />
            <span class="slide-3__leaderboard--fact-text">15 Project Finished</span>
          </div>
          <div class="slide-3__leaderboard--fact-item">
            <span>s</span>
            <span class="slide-3__leaderboard--fact-text">Project Completion</span>
          </div>
        </div>
        <div class="slide-3__leaderboard--points">
          <div class="slide-3__leaderboard--text">
            Total Earned
          </div>
          <div class="slide-3__leaderboard--point">
            21000
          </div>
          <div class="slide-3__leaderboard--text">
            Points
          </div>
        </div>
        <div class="slide-3__leaderboard--title">
          #1 Picasso
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {

  metaInfo () {
    return { title: 'Home' }
  },

  middleware: 'newcomer',

  computed: {
    user () {
      return ''
    },
    ...mapGetters({
      authenticated: 'auth/check',
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {
    let sheet = document.createElement('style')
    sheet.setAttribute('id', 'tempNavBg')
    sheet.innerHTML = '.nav-base { background: #F2F4F6 }'
    document.body.appendChild(sheet)
  },

  destroyed () {
    let sheetToBeRemoved = document.getElementById('tempNavBg')
    let sheetParent = sheetToBeRemoved.parentNode
    sheetParent.removeChild(sheetToBeRemoved)
  }
}
</script>

<style>
.backwards {
  margin: -6rem -3rem -3rem;
}
</style>
